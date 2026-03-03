import type {
  CountdownSummary,
  ExamPaper,
  NoteItem,
  QuestionItem,
  ReviewCard,
  ReviewSummary,
  StatsTotals,
  WeeklyTrendPoint,
} from '@/domain/types'
import type { Repositories } from '@/repositories/contracts'

const emptyCountdown: CountdownSummary = {
  id: 0,
  name: '未配置倒计时',
  targetDate: '1970-01-01',
  daysLeft: 0,
}

const emptyReviewSummary: ReviewSummary = {
  dueToday: 0,
  overdue: 0,
}

export function createApiRepositories(): Repositories {
  return {
    kind: 'api',
    dashboard: {
      getActiveCountdown: () => emptyCountdown,
      getReviewSummary: () => emptyReviewSummary,
    },
    questions: {
      getQuestions: (): QuestionItem[] => [],
    },
    exam: {
      getPapers: (): ExamPaper[] => [],
    },
    review: {
      getCards: (): ReviewCard[] => [],
    },
    notes: {
      getNotes: (): NoteItem[] => [],
    },
    stats: {
      getTotals: (): StatsTotals => ({
        practicedQuestions: 0,
        practicedHours: 0,
        monthlyCount: 0,
        avgSelfScore: 0,
      }),
      getWeeklyTrend: (): WeeklyTrendPoint[] => [],
    },
  }
}
