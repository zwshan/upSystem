<script setup lang="ts">
import { ref } from 'vue'

import AnswerSheet from '@/views/AnswerSheet.vue'
import { useExamStore } from '@/stores/exam'

const store = useExamStore()
const selectedCategory = ref('案例分析')
</script>

<template>
  <section class="layout">
    <article v-if="!store.inSession || store.sessionMode !== 'targeted'" class="card setup">
      <p class="eyebrow">Focused Drill</p>
      <h2 class="section-title">专项练习</h2>

      <label class="field">
        一级题型
        <select v-model="selectedCategory">
          <option>案例分析</option>
          <option>公文写作</option>
          <option>策论文</option>
        </select>
      </label>

      <button type="button" class="btn btn-primary" @click="store.startTargetedPractice(selectedCategory)">
        进入作答
      </button>
    </article>

    <article v-else class="flow">
      <header class="card flow-header">
        <div>
          <p class="eyebrow">Current Session</p>
          <strong>专项练习 · {{ selectedCategory }}</strong>
        </div>
        <button type="button" class="btn btn-danger" @click="store.endSession">结束练习</button>
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
}
</style>
