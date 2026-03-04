"use client";

import {
  ClipboardEvent,
  CompositionEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import styles from "@/app/practice/practice.module.css";

const GRID_COLS = 25;
const GRID_ROWS = 24;
const PAGE_CAPACITY = GRID_COLS * GRID_ROWS;
const DRAFT_SAVE_DELAY = 500;

type DraftPayload = {
  pages: string[];
};

type GridPaperEditorProps = {
  questionId: string;
  disabled: boolean;
};

type ComposingDraft = {
  pageIndex: number;
  cellIndex: number;
  value: string;
};

type PendingEcho = {
  pageIndex: number;
  cellIndex: number;
  value: string;
};

export function getPracticeDraftKey(questionId: string): string {
  return `draft:${questionId}`;
}

function toChars(text: string): string[] {
  return Array.from(text);
}

function normalizePageText(text: string): string {
  return toChars(text).slice(0, PAGE_CAPACITY).join("");
}

function normalizePages(pages: string[] | undefined): string[] {
  const normalized = (pages ?? []).map((item) => normalizePageText(item));
  return normalized.length > 0 ? normalized : [""];
}

function ensurePage(pages: string[], pageIndex: number): string[] {
  if (pageIndex < pages.length) {
    return pages;
  }

  const next = [...pages];
  while (next.length <= pageIndex) {
    next.push("");
  }
  return next;
}

function getCellChar(pages: string[], pageIndex: number, cellIndex: number): string {
  const chars = toChars(pages[pageIndex] ?? "");
  return chars[cellIndex] ?? "";
}

function setCellChar(pages: string[], pageIndex: number, cellIndex: number, value: string): string[] {
  const next = ensurePage([...pages], pageIndex);
  const chars = Array.from({ length: PAGE_CAPACITY }, (_, idx) => getCellChar(next, pageIndex, idx));
  chars[cellIndex] = value;

  let tail = PAGE_CAPACITY;
  while (tail > 0 && chars[tail - 1] === "") {
    tail -= 1;
  }
  next[pageIndex] = chars.slice(0, tail).join("");
  return next;
}

function normalizePasteText(raw: string): string[] {
  const filtered = Array.from(raw)
    .filter((char) => {
      if (char === "\r") return false;
      if (char === "\n" || char === "\t") return true;

      const code = char.charCodeAt(0);
      return code >= 32;
    })
    .map((char) => (char === "\n" || char === "\t" ? " " : char));

  return filtered;
}

export default function GridPaperEditor({ questionId, disabled }: GridPaperEditorProps) {
  const [pages, setPages] = useState<string[]>([""]);
  const [pageIndex, setPageIndex] = useState(0);
  const [cellIndex, setCellIndex] = useState(0);
  const [cursorByPage, setCursorByPage] = useState<Record<number, number>>({ 0: 0 });
  const [storageError, setStorageError] = useState<string | null>(null);
  const [composingDraft, setComposingDraft] = useState<ComposingDraft | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const composingRef = useRef(false);
  const pendingEchoRef = useRef<PendingEcho | null>(null);

  const cells = useMemo(() => Array.from({ length: PAGE_CAPACITY }, (_, idx) => idx), []);

  useEffect(() => {
    setStorageError(null);
    setPageIndex(0);
    setCellIndex(0);
    setCursorByPage({ 0: 0 });
    setComposingDraft(null);

    try {
      const raw = window.localStorage.getItem(getPracticeDraftKey(questionId));
      if (!raw) {
        setPages([""]);
        return;
      }

      const parsed = JSON.parse(raw) as DraftPayload;
      setPages(normalizePages(parsed.pages));
    } catch {
      setPages([""]);
      setStorageError("草稿读取失败，已切换为本次会话临时编辑");
    }
  }, [questionId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          getPracticeDraftKey(questionId),
          JSON.stringify({
            pages
          } satisfies DraftPayload)
        );
      } catch {
        setStorageError("草稿未写入本地，请及时提交保存");
      }
    }, DRAFT_SAVE_DELAY);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pages, questionId]);

  useEffect(() => {
    const input = inputRefs.current[cellIndex];
    input?.focus();
  }, [pageIndex, cellIndex]);

  function updateCursor(nextPageIndex: number, nextCellIndex: number) {
    setPageIndex(nextPageIndex);
    setCellIndex(nextCellIndex);
    setCursorByPage((prev) => ({
      ...prev,
      [nextPageIndex]: nextCellIndex
    }));
  }

  function applyTextAtCursor(textChars: string[]) {
    if (textChars.length === 0) {
      return;
    }

    const startAbs = pageIndex * PAGE_CAPACITY + cellIndex;
    const finalAbs = startAbs + textChars.length;

    setPages((prev) => {
      let next = [...prev];
      let abs = startAbs;

      for (const char of textChars) {
        const targetPage = Math.floor(abs / PAGE_CAPACITY);
        const targetCell = abs % PAGE_CAPACITY;
        next = setCellChar(next, targetPage, targetCell, char);
        abs += 1;
      }
      return next;
    });

    updateCursor(Math.floor(finalAbs / PAGE_CAPACITY), finalAbs % PAGE_CAPACITY);
  }

  function setAbsChar(absIndex: number, value: string) {
    const target = Math.max(0, absIndex);
    const targetPage = Math.floor(target / PAGE_CAPACITY);
    const targetCell = target % PAGE_CAPACITY;

    setPages((prev) => setCellChar(prev, targetPage, targetCell, value));
    updateCursor(targetPage, targetCell);
  }

  function handleCellInput(targetCellIndex: number, nextValue: string) {
    if (composingRef.current) {
      setComposingDraft({
        pageIndex,
        cellIndex: targetCellIndex,
        value: nextValue
      });
      return;
    }

    if (
      pendingEchoRef.current &&
      pendingEchoRef.current.pageIndex === pageIndex &&
      pendingEchoRef.current.cellIndex === targetCellIndex &&
      pendingEchoRef.current.value === nextValue
    ) {
      pendingEchoRef.current = null;
      return;
    }

    const char = Array.from(nextValue).at(-1) ?? "";
    if (!char) {
      return;
    }

    applyTextAtCursor([char]);
  }

  function handleCompositionStart(targetCellIndex: number) {
    composingRef.current = true;
    pendingEchoRef.current = null;
    setComposingDraft({
      pageIndex,
      cellIndex: targetCellIndex,
      value: getCellChar(pages, pageIndex, targetCellIndex)
    });
  }

  function handleCompositionEnd(targetCellIndex: number, event: CompositionEvent<HTMLInputElement>) {
    composingRef.current = false;
    const committed = event.data || event.currentTarget.value;
    setComposingDraft(null);
    const chars = Array.from(committed);
    if (chars.length === 0) {
      return;
    }

    pendingEchoRef.current = {
      pageIndex,
      cellIndex: targetCellIndex,
      value: committed
    };

    applyTextAtCursor(chars);
  }

  function moveBy(delta: number) {
    const currentAbs = pageIndex * PAGE_CAPACITY + cellIndex;
    const nextAbs = Math.max(0, currentAbs + delta);
    updateCursor(Math.floor(nextAbs / PAGE_CAPACITY), nextAbs % PAGE_CAPACITY);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (composingRef.current) {
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      const currentAbs = pageIndex * PAGE_CAPACITY + cellIndex;
      if (currentAbs === 0) {
        return;
      }
      setAbsChar(currentAbs - 1, "");
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      const currentAbs = pageIndex * PAGE_CAPACITY + cellIndex;
      setAbsChar(currentAbs, "");
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveBy(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveBy(-GRID_COLS);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveBy(GRID_COLS);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    applyTextAtCursor(normalizePasteText(pasted));
  }

  function goToPrevPage() {
    if (pageIndex === 0) {
      return;
    }
    const targetPage = pageIndex - 1;
    updateCursor(targetPage, cursorByPage[targetPage] ?? 0);
  }

  function goToNextPage() {
    const targetPage = pageIndex + 1;
    setPages((prev) => ensurePage(prev, targetPage));
    updateCursor(targetPage, cursorByPage[targetPage] ?? 0);
  }

  function addPage() {
    const targetPage = pages.length;
    setPages((prev) => [...prev, ""]);
    updateCursor(targetPage, 0);
  }

  return (
    <section className={styles.paperPane}>
      <div className={styles.paperHeader}>
        <h2 className={styles.paperTitle}>答题纸</h2>
        <p className={styles.paperHint}>每页 24 行，每行 25 格，支持整段粘贴与自动翻页。</p>
      </div>

      <div className={styles.paperPager}>
        <button className={styles.btn} type="button" onClick={goToPrevPage} disabled={disabled || pageIndex === 0}>
          上一页
        </button>
        <span className={styles.pageIndicator}>第 {pageIndex + 1} 页 / {pages.length}</span>
        <button className={styles.btn} type="button" onClick={goToNextPage} disabled={disabled}>
          下一页
        </button>
        <button className={styles.btn} type="button" onClick={addPage} disabled={disabled}>
          新增页
        </button>
      </div>

      {storageError ? <p className={styles.formError}>{storageError}</p> : null}

      <div className={styles.gridWrap}>
        <div className={styles.gridPaper}>
          {cells.map((idx) => {
            const row = Math.floor(idx / GRID_COLS);
            const col = idx % GRID_COLS;

            return (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                className={styles.gridCell}
                aria-label={`第${row + 1}行第${col + 1}格`}
                value={
                  composingDraft &&
                  composingDraft.pageIndex === pageIndex &&
                  composingDraft.cellIndex === idx
                    ? composingDraft.value
                    : getCellChar(pages, pageIndex, idx)
                }
                onFocus={() => updateCursor(pageIndex, idx)}
                onChange={(event) => handleCellInput(idx, event.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onCompositionStart={() => handleCompositionStart(idx)}
                onCompositionEnd={(event) => handleCompositionEnd(idx, event)}
                disabled={disabled}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
