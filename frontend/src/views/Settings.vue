<template>
  <section class="card settings">
    <h2>系统设置</h2>
    <p>管理考试倒计时与备份策略。</p>
    <div class="actions">
      <button type="button">新增倒计时</button>
      <button type="button">手动备份</button>
    </div>
  </section>
</template>

<style scoped>
.settings {
  display: grid;
  gap: 12px;
  max-width: 720px;
  padding: 16px;
}

.actions {
  display: flex;
  gap: 10px;
}
</style>
