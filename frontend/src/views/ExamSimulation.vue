<script setup lang="ts">
import AnswerSheet from '@/views/AnswerSheet.vue'
import { useExamStore } from '@/stores/exam'

const store = useExamStore()
</script>

<template>
  <section class="layout">
    <article v-if="!store.inSession" class="card setup">
      <h2>套题仿真</h2>
      <label>
        选择套卷
        <select v-model.number="store.activePaperId">
          <option v-for="paper in store.papers" :key="paper.id" :value="paper.id">
            {{ paper.title }}
          </option>
        </select>
      </label>
      <button type="button" class="primary-btn" data-testid="start-exam-btn" @click="store.startSimulation">
        开始仿真
      </button>
    </article>

    <article v-else class="flow">
      <header class="card flow-header">
        <strong>{{ store.activePaper?.title }}</strong>
        <span>
          第 {{ store.currentQuestionIndex + 1 }} 题 / {{ store.activePaper?.questions.length }}
        </span>
        <div>
          <button type="button" @click="store.prevQuestion">上一题</button>
          <button type="button" @click="store.nextQuestion">下一题</button>
          <button type="button" @click="store.endSession">交卷</button>
        </div>
      </header>
      <AnswerSheet />
    </article>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  gap: 12px;
}

.setup {
  display: grid;
  gap: 12px;
  max-width: 520px;
  padding: 16px;
}

.flow {
  display: grid;
  gap: 12px;
}

.flow-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
}

.primary-btn {
  background: var(--accent-strong);
  border: 0;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  padding: 10px 14px;
}
</style>
