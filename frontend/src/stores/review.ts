import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { ReviewCard } from '@/domain/types'
import { getRepositories } from '@/repositories/factory'

export const useReviewStore = defineStore('review', () => {
  const cards = ref<ReviewCard[]>(getRepositories().review.getCards())

  const dueToday = computed(() => cards.value.filter((item) => item.dueAt === '今天').length)
  const overdue = computed(() => cards.value.filter((item) => item.dueAt.includes('逾期')).length)

  return {
    cards,
    dueToday,
    overdue,
  }
})
