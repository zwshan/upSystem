<script setup lang="ts">
const props = defineProps<{
  points: Array<{ week: string; value: number }>
}>()
</script>

<template>
  <article class="card chart" data-testid="weekly-trend-chart">
    <h3>每周练习趋势</h3>
    <ul>
      <li v-for="point in props.points" :key="point.week">
        {{ point.week }}: {{ point.value }} 题
      </li>
    </ul>
  </article>
</template>

<style scoped>
.chart {
  padding: 14px;
}

h3 {
  margin: 0 0 10px;
}

ul {
  margin: 0;
  padding-left: 18px;
}
</style>
