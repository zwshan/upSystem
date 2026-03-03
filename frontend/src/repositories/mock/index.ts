import type { NoteItem, ReviewCard, StatsTotals, WeeklyTrendPoint } from '@/domain/types'
import type { Repositories } from '@/repositories/contracts'
import { getActiveCountdownMock, getReviewSummaryMock } from '@/repositories/mock/dashboard.mock'
import { getExamPapersMock } from '@/repositories/mock/exam.mock'
import { getQuestionsMock } from '@/repositories/mock/questions.mock'

const reviewCards: ReviewCard[] = [
  { id: 1, title: '案例分析：社区治理', dueAt: '今天' },
  { id: 2, title: '公文写作：讲话稿结构', dueAt: '今天' },
  { id: 3, title: '策论文：基层治理', dueAt: '逾期 1 天' },
]

const notes: NoteItem[] = [
  { id: 1, title: '归纳概括答题框架', content: '1. 定义问题\n2. 归纳原因\n3. 对策建议' },
  { id: 2, title: '讲话稿开头模板', content: '各位同志，今天我们围绕...展开。' },
]

const totals: StatsTotals = {
  practicedQuestions: 128,
  practicedHours: 61,
  monthlyCount: 34,
  avgSelfScore: 72,
}

const weeklyTrend: WeeklyTrendPoint[] = [
  { week: 'W1', value: 6 },
  { week: 'W2', value: 8 },
  { week: 'W3', value: 9 },
  { week: 'W4', value: 11 },
]

export function createMockRepositories(): Repositories {
  return {
    kind: 'mock',
    dashboard: {
      getActiveCountdown: () => getActiveCountdownMock(),
      getReviewSummary: () => getReviewSummaryMock(),
    },
    questions: {
      getQuestions: () => getQuestionsMock(),
    },
    exam: {
      getPapers: () => getExamPapersMock(),
    },
    review: {
      getCards: () => reviewCards,
    },
    notes: {
      getNotes: () => notes,
    },
    stats: {
      getTotals: () => totals,
      getWeeklyTrend: () => weeklyTrend,
    },
  }
}
