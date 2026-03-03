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
  </article>
</template>

<style scoped>
.panel {
  padding: 18px;
}

.eyebrow {
  color: var(--text-muted);
  margin: 0;
}

.title {
  margin: 8px 0;
}

.meta {
  color: #b42318;
  margin: 0;
}
</style>
