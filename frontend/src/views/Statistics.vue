<script setup lang="ts">
import PracticeTrendChart from '@/components/stats/PracticeTrendChart.vue'
import { useStatsStore } from '@/stores/stats'

const store = useStatsStore()
</script>

<template>
  <section class="layout">
    <article class="card summary-grid">
      <div>
        <p class="label">总练习题数</p>
        <strong>{{ store.totals.practicedQuestions }}</strong>
      </div>
      <div>
        <p class="label">总练习时长（小时）</p>
        <strong>{{ store.totals.practicedHours }}</strong>
      </div>
      <div>
        <p class="label">本月练习量</p>
        <strong>{{ store.totals.monthlyCount }}</strong>
      </div>
      <div>
        <p class="label">平均自评分</p>
        <strong>{{ store.totals.avgSelfScore }}</strong>
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
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 14px;
}

.label {
  color: var(--text-muted);
  margin: 0 0 6px;
}

strong {
  font-size: 22px;
}

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
