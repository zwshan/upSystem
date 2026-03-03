import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type ReviewCard = {
  id: number
  title: string
  dueAt: string
}

export const useReviewStore = defineStore('review', () => {
  const cards = ref<ReviewCard[]>([
    { id: 1, title: '案例分析：社区治理', dueAt: '今天' },
    { id: 2, title: '公文写作：讲话稿结构', dueAt: '今天' },
    { id: 3, title: '策论文：基层治理', dueAt: '逾期 1 天' },
  ])

  const dueToday = computed(() => cards.value.filter((item) => item.dueAt === '今天').length)
  const overdue = computed(() => cards.value.filter((item) => item.dueAt.includes('逾期')).length)

  return {
    cards,
    dueToday,
    overdue,
  }
})
