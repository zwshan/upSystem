<script setup lang="ts">
const props = defineProps<{
  points: Array<{ week: string; value: number }>
}>()

const maxValue = Math.max(...props.points.map((point) => point.value), 1)
</script>

<template>
  <article class="card chart" data-testid="weekly-trend-chart">
    <h3>每周练习趋势</h3>
    <ul>
      <li v-for="point in props.points" :key="point.week">
        <span>{{ point.week }}</span>
        <div class="track" aria-hidden="true">
          <i :style="{ width: `${(point.value / maxValue) * 100}%` }"></i>
        </div>
        <strong>{{ point.value }} 题</strong>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.chart {
  padding: 16px;
}

h3 {
  margin-bottom: 12px;
  font-size: 18px;
  letter-spacing: -0.02em;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

li {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) 58px;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

span,
strong {
  font-size: 13px;
}

span {
  color: var(--text-secondary);
}

.track {
  height: 8px;
  border-radius: 999px;
  background: rgba(16, 24, 40, 0.08);
  overflow: hidden;
}

.track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #5ec6ff, #0a84ff);
}
</style>
