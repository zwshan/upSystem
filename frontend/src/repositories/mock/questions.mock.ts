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

const questionBank: QuestionItem[] = [
  {
    id: 1,
    year: 2025,
    source: '四川省直',
    category: '案例分析',
    subType: '归纳概括',
    wordLimit: 300,
    score: 20,
    prompt: '概括A市嵌入式服务设施建设做法。',
  },
  {
    id: 2,
    year: 2024,
    source: '成都市属',
    category: '公文写作',
    subType: '讲话稿',
    wordLimit: 800,
    score: 40,
    prompt: '起草基层治理工作推进会讲话稿。',
  },
  {
    id: 3,
    year: 2023,
    source: '四川省直',
    category: '策论文',
    subType: '综合论述',
    wordLimit: 1200,
    score: 40,
    prompt: '围绕数字治理现代化撰写策论文。',
  },
]

export function getQuestionsMock(): QuestionItem[] {
  return questionBank
}
