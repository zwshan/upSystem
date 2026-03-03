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

const papers: ExamPaper[] = [
  {
    id: 1,
    title: '2025 四川省直遴选模拟卷',
    year: 2025,
    totalTimeMinutes: 150,
    questions: [
      { id: 101, category: '案例分析', prompt: '概括核心问题并提出建议。', wordLimit: 300 },
      { id: 102, category: '公文写作', prompt: '撰写工作推进会发言提纲。', wordLimit: 800 },
    ],
  },
  {
    id: 2,
    title: '2024 市属遴选真题卷',
    year: 2024,
    totalTimeMinutes: 150,
    questions: [
      { id: 201, category: '策论文', prompt: '围绕基层治理数字化写作。', wordLimit: 1200 },
    ],
  },
]

export function getExamPapersMock(): ExamPaper[] {
  return papers
}
