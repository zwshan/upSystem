<script setup lang="ts">
const props = defineProps<{
  dueToday: number
  overdue: number
}>()
</script>

<template>
  <article class="card panel" data-testid="today-review-card">
    <p class="eyebrow">今日复习</p>
    <h3 class="title">待复习 {{ props.dueToday }} 条</h3>
    <p class="meta">逾期 {{ props.overdue }} 条</p>
    <div class="bar" aria-hidden="true">
      <span class="bar-fill" :style="{ width: `${Math.min(100, (props.overdue / Math.max(1, props.dueToday + props.overdue)) * 100)}%` }"></span>
    </div>
  </article>
</template>

<style scoped>
.panel {
  padding: 18px;
  display: grid;
  gap: 8px;
}

.title {
  font-size: 18px;
  letter-spacing: -0.02em;
}

.meta {
  color: var(--danger);
  font-size: 14px;
}

.bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.08);
  overflow: hidden;
}

.bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f7a151, #ea5757);
}
</style>
