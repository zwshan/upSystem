<template>
  <section class="settings-grid">
    <article class="card settings">
      <p class="eyebrow">System Preferences</p>
      <h2 class="section-title">系统设置</h2>
      <p class="intro">管理考试倒计时、备份策略和前端模式开关。</p>

      <div class="actions">
        <button type="button" class="btn btn-primary">新增倒计时</button>
        <button type="button" class="btn btn-ghost">手动备份</button>
      </div>
    </article>

    <article class="card status">
      <h3>当前运行状态</h3>
      <dl>
        <div>
          <dt>数据源</dt>
          <dd>Mock Repository</dd>
        </div>
        <div>
          <dt>前端版本</dt>
          <dd>Apple Minimal v1</dd>
        </div>
      </dl>
    </article>
  </section>
</template>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.settings,
.status {
  padding: 18px;
  display: grid;
  gap: 12px;
}

.intro {
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status h3 {
  font-size: 18px;
  letter-spacing: -0.02em;
}

.status dl {
  margin: 0;
  display: grid;
  gap: 8px;
}

.status div {
  border: 1px solid var(--stroke-soft);
  border-radius: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.58);
}

.status dt {
  color: var(--text-secondary);
  font-size: 13px;
}

.status dd {
  margin: 4px 0 0;
  font-weight: 620;
}

@media (max-width: 960px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
