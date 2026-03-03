<script setup lang="ts">
const props = defineProps<{
  name: string
  targetDate: string
  daysLeft: number
}>()
</script>

<template>
  <article class="card panel" data-testid="countdown-card">
    <p class="eyebrow">考试倒计时</p>
    <h3 class="title">{{ props.name }}</h3>
    <p class="days">{{ props.daysLeft }} 天</p>
    <p class="meta">目标日期 {{ props.targetDate }}</p>
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

.days {
  color: var(--accent-strong);
  font-size: 34px;
  font-weight: 700;
  margin: 0;
}

.meta {
  color: var(--text-muted);
  margin: 8px 0 0;
}
</style>
