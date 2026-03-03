import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { ExamPaper } from '@/domain/types'
import { getRepositories } from '@/repositories/factory'

export const useExamStore = defineStore('exam', () => {
  const papers = ref<ExamPaper[]>(getRepositories().exam.getPapers())
  const activePaperId = ref<number>(papers.value[0]?.id ?? 0)
  const inSession = ref(false)
  const sessionMode = ref<'simulation' | 'targeted'>('simulation')
  const currentQuestionIndex = ref(0)

  const materialText = ref('请根据材料，围绕基层治理现代化提出可执行建议。')
  const answerText = ref('')
  const elapsedSeconds = ref(0)

  const activePaper = computed(
    () => papers.value.find((paper) => paper.id === activePaperId.value) ?? papers.value[0],
  )

  const currentQuestion = computed(() => activePaper.value?.questions[currentQuestionIndex.value] ?? null)

  function setAnswerText(content: string) {
    answerText.value = content
  }

  function tick() {
    elapsedSeconds.value += 1
  }

  function resetTimer() {
    elapsedSeconds.value = 0
  }

  function startSimulation() {
    inSession.value = true
    sessionMode.value = 'simulation'
    currentQuestionIndex.value = 0
    answerText.value = ''
    resetTimer()
  }

  function startTargetedPractice(category: string) {
    inSession.value = true
    sessionMode.value = 'targeted'
    const foundIndex = activePaper.value?.questions.findIndex((item) => item.category === category) ?? 0
    currentQuestionIndex.value = Math.max(foundIndex, 0)
    answerText.value = ''
    resetTimer()
  }

  function endSession() {
    inSession.value = false
  }

  function nextQuestion() {
    if (!activePaper.value) {
      return
    }

    currentQuestionIndex.value = Math.min(
      currentQuestionIndex.value + 1,
      activePaper.value.questions.length - 1,
    )
  }

  function prevQuestion() {
    currentQuestionIndex.value = Math.max(currentQuestionIndex.value - 1, 0)
  }

  return {
    activePaper,
    activePaperId,
    answerText,
    currentQuestion,
    currentQuestionIndex,
    elapsedSeconds,
    endSession,
    inSession,
    materialText,
    nextQuestion,
    papers,
    prevQuestion,
    resetTimer,
    sessionMode,
    setAnswerText,
    startSimulation,
    startTargetedPractice,
    tick,
  }
})
