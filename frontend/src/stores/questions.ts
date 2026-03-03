import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { QuestionItem } from '@/domain/types'
import { getRepositories } from '@/repositories/factory'

export const useQuestionsStore = defineStore('questions', () => {
  const questions = ref<QuestionItem[]>(getRepositories().questions.getQuestions())
  const categoryFilter = ref<string>('全部')
  const drawerOpen = ref(false)
  const activeQuestion = ref<QuestionItem | null>(null)

  const filteredQuestions = computed(() => {
    if (categoryFilter.value === '全部') {
      return questions.value
    }

    return questions.value.filter((item) => item.category === categoryFilter.value)
  })

  function openCreateDrawer() {
    activeQuestion.value = null
    drawerOpen.value = true
  }

  function openEditDrawer(item: QuestionItem) {
    activeQuestion.value = item
    drawerOpen.value = true
  }

  function closeDrawer() {
    drawerOpen.value = false
  }

  return {
    questions,
    categoryFilter,
    filteredQuestions,
    drawerOpen,
    activeQuestion,
    closeDrawer,
    openCreateDrawer,
    openEditDrawer,
  }
})
