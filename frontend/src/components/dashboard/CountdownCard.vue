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
    <p class="days value-number">{{ props.daysLeft }}</p>
    <p class="meta">距离目标日期 {{ props.targetDate }}</p>
  </article>
</template>

<style scoped>
.panel {
  padding: 18px;
  display: grid;
  gap: 6px;
}

.title {
  font-size: 18px;
  letter-spacing: -0.02em;
}

.days {
  font-size: clamp(34px, 4.5vw, 46px);
  color: var(--accent-strong);
  line-height: 1;
}

.meta {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
