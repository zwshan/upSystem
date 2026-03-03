export type CountdownSummary = {
  id: number
  name: string
  targetDate: string
  daysLeft: number
}

export type ReviewSummary = {
  dueToday: number
  overdue: number
}

export function getActiveCountdownMock(): CountdownSummary {
  return {
    id: 1,
    name: '2026 四川省直遴选',
    targetDate: '2026-09-26',
    daysLeft: 207,
  }
}

export function getReviewSummaryMock(): ReviewSummary {
  return {
    dueToday: 6,
    overdue: 2,
  }
}
