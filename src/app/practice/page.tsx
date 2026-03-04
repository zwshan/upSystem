"use client";

import { useEffect, useRef, useState } from "react";

import GridPaperEditor, { getPracticeDraftKey } from "@/app/practice/components/grid-paper-editor";
import PracticeFilterPanel from "@/app/practice/components/practice-filter-panel";
import PracticeQuestionPane, { PracticeQuestion } from "@/app/practice/components/practice-question-pane";
import styles from "@/app/practice/practice.module.css";

type BankItem = {
  id: string;
  name: string;
};

type QuestionTypeItem = {
  name?: string;
};

type NextQuestionResponse = {
  userId: string;
  question: PracticeQuestion;
};

type SubmitResult = {
  sessionId: string;
  reviewCardId: string;
};

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export default function PracticePage() {
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [bankId, setBankId] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBanks() {
      const response = await fetch("/api/banks");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "题库加载失败"));
      }

      const data = (await response.json()) as { items?: BankItem[] };
      let items = data.items ?? [];

      if (items.length === 0) {
        const createResponse = await fetch("/api/banks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "默认题库",
            description: "自动创建的默认题库"
          })
        });
        if (!createResponse.ok) {
          throw new Error(await readErrorMessage(createResponse, "默认题库创建失败"));
        }
        const created = (await createResponse.json()) as BankItem;
        items = [created];
      }

      if (!cancelled) {
        setBanks(items);
        setBankId((current) => current || items[0]?.id || "");
      }
    }

    async function loadTypes() {
      const response = await fetch("/api/question-types");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "题型加载失败"));
      }
      const data = (await response.json()) as { items?: QuestionTypeItem[] };
      const names = (data.items ?? [])
        .map((item) => item.name?.trim() ?? "")
        .filter((item) => item.length > 0);

      if (!cancelled) {
        setQuestionTypes(names);
      }
    }

    async function bootstrap() {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([loadBanks(), loadTypes()]);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "加载失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  function showSavedToast() {
    setToastVisible(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
      toastTimerRef.current = null;
    }, 1200);
  }

  async function handleStart() {
    if (!bankId) {
      setError("请先选择题库");
      return;
    }

    setStarting(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        bankId
      });
      if (type.trim()) {
        query.set("type", type.trim());
      }

      const response = await fetch(`/api/practice/next?${query.toString()}`);
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "抽题失败，请重试"));
      }

      const data = (await response.json()) as NextQuestionResponse;
      setQuestion(data.question);
      setUserId(data.userId);
    } catch (startError) {
      setQuestion(null);
      setUserId(null);
      setError(startError instanceof Error ? startError.message : "抽题失败，请重试");
    } finally {
      setStarting(false);
    }
  }

  async function handleSubmitScore(score: number) {
    if (!userId || !question) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          questionId: question.id,
          selfScore: score
        })
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "提交失败，请重试"));
      }

      await response.json() as SubmitResult;

      try {
        localStorage.removeItem(getPracticeDraftKey(question.id));
      } catch {
        // ignore storage errors on cleanup
      }

      setQuestion(null);
      setUserId(null);
      showSavedToast();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  const mode = question ? "solving" : "filter";

  return (
    <main data-theme="glass-dark" className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>刷题</h1>
          <p className={styles.subtitle}>先选条件再开始，单题完成后回到筛选区继续下一题。</p>
        </header>

        {toastVisible ? (
          <div className={styles.centerToastWrap}>
            <div className={styles.centerToast}>已保存</div>
          </div>
        ) : null}

        {error ? <p className={styles.formError}>{error}</p> : null}
        {loading ? <p className={styles.info}>加载中...</p> : null}

        {!loading && mode === "filter" ? (
          <PracticeFilterPanel
            banks={banks}
            questionTypes={questionTypes}
            bankId={bankId}
            type={type}
            starting={starting}
            onBankChange={setBankId}
            onTypeChange={setType}
            onStart={() => void handleStart()}
          />
        ) : null}

        {!loading && mode === "solving" && question ? (
          <section className={styles.workspace}>
            <div className={styles.leftPane}>
              <PracticeQuestionPane
                question={question}
                submitting={submitting}
                onSubmitScore={(score) => void handleSubmitScore(score)}
              />
            </div>
            <div className={styles.rightPane}>
              <GridPaperEditor questionId={question.id} disabled={submitting} />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
