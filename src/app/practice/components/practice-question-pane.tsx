"use client";

import { useState } from "react";

import styles from "@/app/practice/practice.module.css";

export type PracticeQuestion = {
  id: string;
  summary: string;
  prompt: string;
  referenceAnswer?: string | null;
  scoreValue: number;
  wordLimit: string;
  questionType: string;
  materials: Array<{ seq: number; content: string }>;
};

type PracticeQuestionPaneProps = {
  question: PracticeQuestion;
  submitting: boolean;
  onSubmitScore: (score: number) => void | Promise<void>;
};

const SCORE_OPTIONS = [0, 1, 2, 3, 4, 5];

export default function PracticeQuestionPane({
  question,
  submitting,
  onSubmitScore
}: PracticeQuestionPaneProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  return (
    <section className={styles.questionPane}>
      <h2 className={styles.questionTitle}>{question.summary}</h2>

      <div className={styles.metaRow}>
        <span>题型：{question.questionType}</span>
        <span>分值：{question.scoreValue}</span>
        <span>字数：{question.wordLimit}</span>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>题目材料</h3>
        <ol className={styles.materialList}>
          {question.materials.map((item) => (
            <li key={`${item.seq}-${item.content}`}>
              {item.content}
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>题目问题</h3>
        <p className={styles.promptText}>{question.prompt}</p>
      </div>

      <div className={styles.block}>
        <button className={styles.btn} type="button" onClick={() => setShowAnswer((prev) => !prev)}>
          {showAnswer ? "隐藏参考答案" : "显示参考答案"}
        </button>
        {showAnswer ? (
          <div className={styles.answerCard}>
            <h3 className={styles.blockTitle}>参考答案</h3>
            <p className={styles.promptText}>{question.referenceAnswer || "暂无参考答案"}</p>
          </div>
        ) : null}
      </div>

      <div className={styles.scoreRow}>
        {SCORE_OPTIONS.map((score) => (
          <button
            key={score}
            type="button"
            className={`${styles.scoreBtn} ${selectedScore === score ? styles.scoreBtnActive : ""}`}
            onClick={() => setSelectedScore(score)}
            disabled={submitting}
          >
            {score}分
          </button>
        ))}
      </div>

      <button
        className={styles.btn}
        type="button"
        onClick={() => selectedScore !== null && onSubmitScore(selectedScore)}
        disabled={selectedScore === null || submitting}
      >
        {submitting ? "提交中..." : "提交自评并完成本题"}
      </button>
    </section>
  );
}
