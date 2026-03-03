import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStatsStore = defineStore('stats', () => {
  const totals = ref({
    practicedQuestions: 128,
    practicedHours: 61,
    monthlyCount: 34,
    avgSelfScore: 72,
  })

  const weeklyTrend = ref([
    { week: 'W1', value: 6 },
    { week: 'W2', value: 8 },
    { week: 'W3', value: 9 },
    { week: 'W4', value: 11 },
  ])

  return {
    totals,
    weeklyTrend,
  }
})
