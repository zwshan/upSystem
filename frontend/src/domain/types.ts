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

export type QuestionItem = {
  id: number
  year: number
  source: string
  category: string
  subType: string
  wordLimit: number
  score: number
  prompt: string
}

export type ExamQuestion = {
  id: number
  category: string
  prompt: string
  wordLimit: number
}

export type ExamPaper = {
  id: number
  title: string
  year: number
  totalTimeMinutes: number
  questions: ExamQuestion[]
}

export type ReviewCard = {
  id: number
  title: string
  dueAt: string
}

export type NoteItem = {
  id: number
  title: string
  content: string
}

export type StatsTotals = {
  practicedQuestions: number
  practicedHours: number
  monthlyCount: number
  avgSelfScore: number
}

export type WeeklyTrendPoint = {
  week: string
  value: number
}
