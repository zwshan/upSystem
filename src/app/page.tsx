import Link from "next/link";

import styles from "./home.module.css";

export default function HomePage() {
  return (
    <main data-theme="glass-dark" className={styles.page}>
      <div className={styles.noise} />
      <div className={styles.shell}>
        <nav className={styles.topNav} aria-label="secondary-nav">
          <Link href="/settings">设置</Link>
          <Link href="/banks">题库管理</Link>
          <Link href="/backup">备份</Link>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.title}>团圆学习平台</h1>
            <p className={styles.subtitle}>保持注意力在最核心的两件事上：稳定刷题，按节奏复习。</p>
            <div className={styles.actions} aria-label="primary-actions">
              <Link className={styles.primaryBtn} href="/practice" aria-label="刷题">
                <span className={styles.btnName}>刷题</span>
                <span className={styles.btnDesc}>随机或按条件抽题，快速进入答题状态。</span>
              </Link>
              <Link className={styles.primaryBtn} href="/review" aria-label="复习">
                <span className={styles.btnName}>复习</span>
                <span className={styles.btnDesc}>按到期队列复习，自评 0-5 自动安排下次节奏。</span>
              </Link>
            </div>
          </div>
        </section>

        <div className={styles.footerTip}>Local-first • Fullscreen-ready • Glass UI</div>
      </div>
    </main>
  );
}
