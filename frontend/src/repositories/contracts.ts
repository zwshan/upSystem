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

export interface DashboardRepository {
  getActiveCountdown(): CountdownSummary
  getReviewSummary(): ReviewSummary
}

export interface QuestionsRepository {
  getQuestions(): QuestionItem[]
}

export interface ExamRepository {
  getPapers(): ExamPaper[]
}

export interface ReviewRepository {
  getCards(): ReviewCard[]
}

export interface NotesRepository {
  getNotes(): NoteItem[]
}

export interface StatsRepository {
  getTotals(): StatsTotals
  getWeeklyTrend(): WeeklyTrendPoint[]
}

export type Repositories = {
  kind: 'mock' | 'api'
  dashboard: DashboardRepository
  questions: QuestionsRepository
  exam: ExamRepository
  review: ReviewRepository
  notes: NotesRepository
  stats: StatsRepository
}
