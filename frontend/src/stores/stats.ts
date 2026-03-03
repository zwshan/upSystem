import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getRepositories } from '@/repositories/factory'

export const useStatsStore = defineStore('stats', () => {
  const totals = ref(getRepositories().stats.getTotals())
  const weeklyTrend = ref(getRepositories().stats.getWeeklyTrend())

  return {
    totals,
    weeklyTrend,
  }
})
