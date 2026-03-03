import { defineStore } from 'pinia'

import type { CountdownSummary, ReviewSummary } from '@/domain/types'
import { getRepositories } from '@/repositories/factory'

interface DashboardState {
  countdown: CountdownSummary
  review: ReviewSummary
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    countdown: getRepositories().dashboard.getActiveCountdown(),
    review: getRepositories().dashboard.getReviewSummary(),
  }),
})
