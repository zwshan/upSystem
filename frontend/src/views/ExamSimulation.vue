<script setup lang="ts">
import AnswerSheet from '@/views/AnswerSheet.vue'
import { useExamStore } from '@/stores/exam'

const store = useExamStore()
</script>

<template>
  <section class="layout">
    <article v-if="!store.inSession" class="card setup">
      <p class="eyebrow">Simulation</p>
      <h2 class="section-title">套题仿真</h2>

      <label class="field">
        选择套卷
        <select v-model.number="store.activePaperId">
          <option v-for="paper in store.papers" :key="paper.id" :value="paper.id">
            {{ paper.title }}
          </option>
        </select>
      </label>

      <button type="button" class="btn btn-primary" data-testid="start-exam-btn" @click="store.startSimulation">
        开始仿真
      </button>
    </article>

    <article v-else class="flow">
      <header class="card flow-header">
        <div>
          <p class="eyebrow">Current Paper</p>
          <strong>{{ store.activePaper?.title }}</strong>
        </div>

        <span class="progress">第 {{ store.currentQuestionIndex + 1 }} 题 / {{ store.activePaper?.questions.length }}</span>

        <div class="actions">
          <button type="button" class="btn btn-ghost" @click="store.prevQuestion">上一题</button>
          <button type="button" class="btn btn-ghost" @click="store.nextQuestion">下一题</button>
          <button type="button" class="btn btn-danger" @click="store.endSession">交卷</button>
        </div>
      </header>

      <AnswerSheet />
    </article>
  </section>
</template>

<style scoped>
.layout,
.flow {
  display: grid;
  gap: 12px;
}

.setup {
  max-width: 560px;
  padding: 18px;
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.flow-header {
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.progress {
  color: var(--text-secondary);
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
