import { defineStore } from 'pinia'

import {
  getActiveCountdownMock,
  getReviewSummaryMock,
  type CountdownSummary,
  type ReviewSummary,
} from '@/repositories/mock/dashboard.mock'

interface DashboardState {
  countdown: CountdownSummary
  review: ReviewSummary
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    countdown: getActiveCountdownMock(),
    review: getReviewSummaryMock(),
  }),
})
