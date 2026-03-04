"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import QuestionForm, {
  QuestionFormInitialValue,
  QuestionFormSubmitPayload
} from "@/app/banks/components/question-form";
import { joinMaterialsToText } from "@/app/banks/utils/material-transform";
import styles from "@/app/banks/banks.module.css";

type EditorMode = "create" | "edit";

type QuestionDetail = {
  id: string;
  summary: string;
  prompt: string;
  referenceAnswer?: string | null;
  scoreValue: number;
  wordLimit: string;
  questionType: string;
  tags?: Record<string, unknown> | null;
  materials: Array<{ seq: number; content: string }>;
};

type QuestionEditorPageProps = {
  initialMode: EditorMode;
  initialQuestionId?: string;
  bankId?: string;
};

function toFormInitialValue(question: QuestionDetail): QuestionFormInitialValue {
  return {
    summary: question.summary,
    prompt: question.prompt,
    referenceAnswer: question.referenceAnswer ?? "",
    scoreValue: question.scoreValue,
    wordLimit: question.wordLimit,
    questionType: question.questionType,
    tags: (question.tags as Record<string, unknown>) ?? undefined,
    materialText: joinMaterialsToText(question.materials ?? [])
  };
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export default function QuestionEditorPage({ initialMode, initialQuestionId, bankId }: QuestionEditorPageProps) {
  const router = useRouter();

  const [mode, setMode] = useState<EditorMode>(initialMode);
  const [questionId, setQuestionId] = useState<string | undefined>(initialQuestionId);
  const [resolvedBankId, setResolvedBankId] = useState<string | undefined>(bankId);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialValue, setInitialValue] = useState<QuestionFormInitialValue | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [questionTypeOptions, setQuestionTypeOptions] = useState<string[]>([]);
  const [savedToastVisible, setSavedToastVisible] = useState(false);

  const hideToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = useMemo(() => (mode === "create" ? "新建题目" : "编辑题目"), [mode]);

  useEffect(() => {
    setMode(initialMode);
    setQuestionId(initialQuestionId);
  }, [initialMode, initialQuestionId]);

  useEffect(() => {
    setResolvedBankId(bankId);
  }, [bankId]);

  useEffect(() => {
    return () => {
      if (hideToastTimerRef.current) {
        clearTimeout(hideToastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mode !== "create" || resolvedBankId) {
      return;
    }

    let cancelled = false;

    async function resolveBankId() {
      try {
        const response = await fetch("/api/banks");
        if (!response.ok) {
          throw new Error(await readErrorMessage(response, "题库加载失败"));
        }

        const data = (await response.json()) as {
          items?: Array<{
            id: string;
          }>;
        };

        let target = data.items?.[0]?.id;
        if (!target) {
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
          const created = (await createResponse.json()) as { id: string };
          target = created.id;
        }

        if (!cancelled) {
          setResolvedBankId(target);
        }
      } catch (resolveError) {
        if (!cancelled) {
          setError(resolveError instanceof Error ? resolveError.message : "题库加载失败");
        }
      }
    }

    void resolveBankId();

    return () => {
      cancelled = true;
    };
  }, [mode, resolvedBankId]);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestionTypes() {
      const response = await fetch("/api/question-types");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "题型加载失败"));
      }

      const data = (await response.json()) as {
        items?: Array<{
          name?: string;
        }>;
      };

      const names = (data.items ?? [])
        .map((item) => item.name?.trim() ?? "")
        .filter((name) => name.length > 0);

      if (!cancelled) {
        setQuestionTypeOptions(names);
      }
    }

    async function loadQuestionDetail(id: string) {
      const response = await fetch(`/api/questions/${id}`);
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "题目详情加载失败"));
      }
      const detail = (await response.json()) as QuestionDetail;
      if (!cancelled) {
        setInitialValue(toFormInitialValue(detail));
      }
    }

    async function bootstrap() {
      setLoading(true);
      setError(null);
      setInitialValue(mode === "create" ? {} : undefined);
      setDirty(false);

      try {
        await loadQuestionTypes();

        if (mode === "edit") {
          if (!questionId) {
            throw new Error("缺少题目 ID");
          }
          await loadQuestionDetail(questionId);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "加载失败，请重试");
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
  }, [mode, questionId]);

  async function handleCreateQuestionType(name: string) {
    const response = await fetch("/api/question-types", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, "新增题型失败"));
    }

    const data = (await response.json()) as { name?: string };
    const normalizedName = data.name?.trim() ?? name;
    setQuestionTypeOptions((prev) =>
      prev.includes(normalizedName) ? prev : [...prev, normalizedName]
    );
  }

  function showSavedToast() {
    setSavedToastVisible(true);

    if (hideToastTimerRef.current) {
      clearTimeout(hideToastTimerRef.current);
    }

    hideToastTimerRef.current = setTimeout(() => {
      setSavedToastVisible(false);
      hideToastTimerRef.current = null;
    }, 1200);
  }

  async function handleSubmit(payload: QuestionFormSubmitPayload) {
    setSubmitting(true);
    setError(null);

    try {
      let response: Response;

      if (mode === "create") {
        if (!resolvedBankId) {
          throw new Error("请先从题库页进入新建题目");
        }

        response = await fetch("/api/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            bankId: resolvedBankId,
            ...payload
          })
        });
      } else {
        if (!questionId) {
          throw new Error("缺少题目 ID");
        }

        response = await fetch(`/api/questions/${questionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "保存失败，请重试"));
      }

      const saved = (await response.json()) as QuestionDetail;
      setInitialValue(toFormInitialValue(saved));
      setDirty(false);
      showSavedToast();

      if (mode === "create") {
        setMode("edit");
        setQuestionId(saved.id);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackToBanks() {
    if (dirty && !window.confirm("有未保存更改，是否离开？")) {
      return;
    }

    router.push("/banks");
  }

  return (
    <main data-theme="glass-dark" className={styles.editorPage}>
      <div className={styles.editorShell}>
        <header className={styles.editorHeader}>
          <button className={styles.btn} type="button" onClick={handleBackToBanks}>
            返回题库
          </button>
          <div className={styles.editorHeaderText}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.drawerHint}>整页编辑模式，保存后继续停留当前页面。</p>
          </div>
        </header>

        {loading ? <p className={styles.drawerInfo}>加载中...</p> : null}
        {error ? (
          <p role="alert" className={styles.formError}>
            {error}
          </p>
        ) : null}

        {!loading ? (
          <QuestionForm
            mode={mode}
            initialValue={initialValue}
            submitting={submitting}
            onSubmit={handleSubmit}
            onDirtyChange={setDirty}
            questionTypeOptions={questionTypeOptions}
            onCreateQuestionType={handleCreateQuestionType}
          />
        ) : null}
      </div>

      {savedToastVisible ? (
        <div className={styles.centerToastWrap}>
          <div className={styles.centerToast}>已保存</div>
        </div>
      ) : null}
    </main>
  );
}
