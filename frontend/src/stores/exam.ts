import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExamStore = defineStore('exam', () => {
  const materialText = ref('请根据材料，围绕基层治理现代化提出可执行建议。')
  const answerText = ref('')
  const elapsedSeconds = ref(0)

  function setAnswerText(content: string) {
    answerText.value = content
  }

  function tick() {
    elapsedSeconds.value += 1
  }

  function resetTimer() {
    elapsedSeconds.value = 0
  }

  return {
    answerText,
    elapsedSeconds,
    materialText,
    resetTimer,
    setAnswerText,
    tick,
  }
})
