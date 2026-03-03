import { createRouter, createWebHistory } from 'vue-router'

import AnswerSheet from '@/views/AnswerSheet.vue'
import Dashboard from '@/views/Dashboard.vue'
import ExamSimulation from '@/views/ExamSimulation.vue'
import NoteManager from '@/views/NoteManager.vue'
import QuestionManager from '@/views/QuestionManager.vue'
import ReviewCenter from '@/views/ReviewCenter.vue'
import Settings from '@/views/Settings.vue'
import Statistics from '@/views/Statistics.vue'
import TargetedPractice from '@/views/TargetedPractice.vue'

export const routes = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/exam-simulation', name: 'exam-simulation', component: ExamSimulation },
  { path: '/targeted-practice', name: 'targeted-practice', component: TargetedPractice },
  { path: '/answer-sheet', name: 'answer-sheet', component: AnswerSheet },
  { path: '/question-manager', name: 'question-manager', component: QuestionManager },
  { path: '/review-center', name: 'review-center', component: ReviewCenter },
  { path: '/note-manager', name: 'note-manager', component: NoteManager },
  { path: '/statistics', name: 'statistics', component: Statistics },
  { path: '/settings', name: 'settings', component: Settings },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
