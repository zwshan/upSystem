"use client";

import styles from "@/app/practice/practice.module.css";

type BankItem = {
  id: string;
  name: string;
};

type PracticeFilterPanelProps = {
  banks: BankItem[];
  questionTypes: string[];
  bankId: string;
  type: string;
  starting: boolean;
  onBankChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStart: () => void;
};

export default function PracticeFilterPanel({
  banks,
  questionTypes,
  bankId,
  type,
  starting,
  onBankChange,
  onTypeChange,
  onStart
}: PracticeFilterPanelProps) {
  return (
    <section className={styles.filterPanel}>
      <div className={styles.filterFields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="practice-bank">
            题库
          </label>
          <select
            id="practice-bank"
            className={styles.select}
            aria-label="题库"
            value={bankId}
            onChange={(event) => onBankChange(event.target.value)}
          >
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="practice-type">
            题型
          </label>
          <select
            id="practice-type"
            className={styles.select}
            aria-label="题型"
            value={type}
            onChange={(event) => onTypeChange(event.target.value)}
          >
            <option value="">不限题型</option>
            {questionTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.filterActions}>
        <button className={styles.btn} type="button" onClick={onStart} disabled={!bankId || starting}>
          {starting ? "抽题中..." : "开始刷题"}
        </button>
      </div>
    </section>
  );
}
