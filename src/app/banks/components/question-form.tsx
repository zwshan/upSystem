"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { splitMaterialText } from "@/app/banks/utils/material-transform";
import styles from "@/app/banks/banks.module.css";

export type QuestionFormInitialValue = {
  summary?: string;
  prompt?: string;
  referenceAnswer?: string;
  scoreValue?: number;
  wordLimit?: string;
  questionType?: string;
  tags?: Record<string, unknown>;
  materialText?: string;
};

export type QuestionFormSubmitPayload = {
  summary: string;
  prompt: string;
  referenceAnswer?: string;
  scoreValue: number;
  wordLimit: string;
  questionType: string;
  tags?: Record<string, unknown>;
  materials: Array<{ seq: number; content: string }>;
};

type QuestionFormProps = {
  mode: "create" | "edit";
  initialValue?: QuestionFormInitialValue;
  submitting?: boolean;
  onSubmit: (payload: QuestionFormSubmitPayload) => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  questionTypeOptions?: string[];
  onCreateQuestionType?: (name: string) => Promise<void>;
};

function normalizeInitialValue(initialValue?: QuestionFormInitialValue) {
  return {
    summary: initialValue?.summary ?? "",
    prompt: initialValue?.prompt ?? "",
    referenceAnswer: initialValue?.referenceAnswer ?? "",
    scoreValue: initialValue?.scoreValue?.toString() ?? "",
    wordLimit: initialValue?.wordLimit ?? "",
    questionType: initialValue?.questionType ?? "",
    materialText: initialValue?.materialText ?? ""
  };
}

export default function QuestionForm({
  mode,
  initialValue,
  submitting = false,
  onSubmit,
  onDirtyChange,
  questionTypeOptions = [],
  onCreateQuestionType
}: QuestionFormProps) {
  const initial = useMemo(() => normalizeInitialValue(initialValue), [initialValue]);

  const [summary, setSummary] = useState(initial.summary);
  const [prompt, setPrompt] = useState(initial.prompt);
  const [referenceAnswer, setReferenceAnswer] = useState(initial.referenceAnswer);
  const [scoreValue, setScoreValue] = useState(initial.scoreValue);
  const [wordLimit, setWordLimit] = useState(initial.wordLimit);
  const [questionType, setQuestionType] = useState(initial.questionType);
  const [materialText, setMaterialText] = useState(initial.materialText);
  const [newQuestionType, setNewQuestionType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const normalized = normalizeInitialValue(initialValue);
    setSummary(normalized.summary);
    setPrompt(normalized.prompt);
    setReferenceAnswer(normalized.referenceAnswer);
    setScoreValue(normalized.scoreValue);
    setWordLimit(normalized.wordLimit);
    setQuestionType(normalized.questionType);
    setMaterialText(normalized.materialText);
    setError(null);
    setDirty(false);
    onDirtyChange?.(false);
  }, [initialValue, onDirtyChange]);

  function markDirty() {
    if (!dirty) {
      setDirty(true);
      onDirtyChange?.(true);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedSummary = summary.trim();
    if (!normalizedSummary) {
      setError("题目摘要不能为空");
      return;
    }

    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) {
      setError("题目问题不能为空");
      return;
    }

    const parsedScore = Number(scoreValue);
    if (!Number.isInteger(parsedScore) || parsedScore <= 0) {
      setError("题目分值必须是正整数");
      return;
    }

    const normalizedWordLimit = wordLimit.trim();
    if (!normalizedWordLimit) {
      setError("字数要求不能为空");
      return;
    }

    const normalizedQuestionType = questionType.trim();
    if (!normalizedQuestionType) {
      setError("题目类型不能为空");
      return;
    }

    const materials = splitMaterialText(materialText);
    if (materials.length === 0) {
      setError("题目材料不能为空");
      return;
    }

    await onSubmit({
      summary: normalizedSummary,
      prompt: normalizedPrompt,
      referenceAnswer: referenceAnswer.trim() || undefined,
      scoreValue: parsedScore,
      wordLimit: normalizedWordLimit,
      questionType: normalizedQuestionType,
      materials
    });

    if (dirty) {
      setDirty(false);
      onDirtyChange?.(false);
    }
  }

  async function handleCreateQuestionType() {
    const name = newQuestionType.trim();
    if (!name || !onCreateQuestionType) {
      return;
    }
    await onCreateQuestionType(name);
    setQuestionType(name);
    setNewQuestionType("");
    markDirty();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="summary">
          题目摘要
        </label>
        <input
          className={styles.input}
          id="summary"
          value={summary}
          onChange={(event) => {
            setSummary(event.target.value);
            markDirty();
          }}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="prompt">
          题目问题
        </label>
        <textarea
          className={styles.textarea}
          id="prompt"
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value);
            markDirty();
          }}
        />
      </div>

      <div className={styles.dualFields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scoreValue">
            题目分值
          </label>
          <input
            className={styles.input}
            id="scoreValue"
            type="number"
            value={scoreValue}
            onChange={(event) => {
              setScoreValue(event.target.value);
              markDirty();
            }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="wordLimit">
            字数要求
          </label>
          <input
            className={styles.input}
            id="wordLimit"
            value={wordLimit}
            onChange={(event) => {
              setWordLimit(event.target.value);
              markDirty();
            }}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="questionType">
          题目类型
        </label>
        <input
          className={styles.input}
          id="questionType"
          list="question-type-options"
          value={questionType}
          onChange={(event) => {
            setQuestionType(event.target.value);
            markDirty();
          }}
        />
        <datalist id="question-type-options">
          {questionTypeOptions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="newQuestionType">
          新增题型
        </label>
        <div className={styles.inlineRow}>
          <input
            className={styles.input}
            id="newQuestionType"
            value={newQuestionType}
            onChange={(event) => setNewQuestionType(event.target.value)}
          />
          <button
            className={styles.btn}
            type="button"
            onClick={handleCreateQuestionType}
            disabled={!onCreateQuestionType || !newQuestionType.trim()}
          >
            新增题型
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="materialText">
          题目材料
        </label>
        <textarea
          className={styles.textarea}
          id="materialText"
          value={materialText}
          onChange={(event) => {
            setMaterialText(event.target.value);
            markDirty();
          }}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="referenceAnswer">
          参考答案
        </label>
        <textarea
          className={styles.textarea}
          id="referenceAnswer"
          value={referenceAnswer}
          onChange={(event) => {
            setReferenceAnswer(event.target.value);
            markDirty();
          }}
        />
      </div>

      {error ? (
        <p role="alert" className={styles.formError}>
          {error}
        </p>
      ) : null}

      <div className={styles.formActions}>
        <button className={styles.btn} type="submit" disabled={submitting}>
          {submitting ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}
