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
      <h2>专项练习</h2>
      <label>
        一级题型
        <select v-model="selectedCategory">
          <option>案例分析</option>
          <option>公文写作</option>
          <option>策论文</option>
        </select>
      </label>
      <button type="button" class="primary-btn" @click="store.startTargetedPractice(selectedCategory)">
        进入作答
      </button>
    </article>

    <article v-else class="flow">
      <header class="card flow-header">
        <strong>专项练习 · {{ selectedCategory }}</strong>
        <button type="button" @click="store.endSession">结束练习</button>
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
