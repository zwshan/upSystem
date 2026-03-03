<script setup lang="ts">
import PracticeTrendChart from '@/components/stats/PracticeTrendChart.vue'
import { useStatsStore } from '@/stores/stats'

const store = useStatsStore()
</script>

<template>
  <section class="layout">
    <article class="card summary-grid">
      <div class="metric">
        <p class="label">总练习题数</p>
        <strong class="value-number">{{ store.totals.practicedQuestions }}</strong>
      </div>
      <div class="metric">
        <p class="label">总练习时长（小时）</p>
        <strong class="value-number">{{ store.totals.practicedHours }}</strong>
      </div>
      <div class="metric">
        <p class="label">本月练习量</p>
        <strong class="value-number">{{ store.totals.monthlyCount }}</strong>
      </div>
      <div class="metric">
        <p class="label">平均自评分</p>
        <strong class="value-number">{{ store.totals.avgSelfScore }}</strong>
      </div>
    </article>

    <PracticeTrendChart :points="store.weeklyTrend" />
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  gap: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
}

.metric {
  border: 1px solid var(--stroke-soft);
  border-radius: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.58);
  display: grid;
  gap: 8px;
}

.label {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

strong {
  font-size: clamp(24px, 2.5vw, 30px);
}

@media (max-width: 1024px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
