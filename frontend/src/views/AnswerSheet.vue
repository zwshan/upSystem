<script setup lang="ts">
import GridPaper from '@/components/exam/GridPaper.vue'
import Timer from '@/components/exam/Timer.vue'
import { useExamStore } from '@/stores/exam'

const store = useExamStore()
</script>

<template>
  <section class="answer-layout" data-testid="answer-sheet-entry">
    <aside class="card material-panel">
      <p class="eyebrow">Material</p>
      <h3>材料区</h3>
      <p class="material-copy">{{ store.materialText }}</p>
    </aside>

    <article class="card answer-panel">
      <Timer
        :seconds="store.elapsedSeconds"
        @start="store.tick"
        @pause="() => undefined"
        @reset="store.resetTimer"
      />
      <GridPaper v-model="store.answerText" :word-limit="600" />
    </article>
  </section>
</template>

<style scoped>
.answer-layout {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 12px;
}

.material-panel,
.answer-panel {
  padding: 16px;
}

.material-panel {
  display: grid;
  align-content: start;
  gap: 8px;
}

.material-copy {
  color: var(--text-secondary);
  line-height: 1.65;
  white-space: pre-wrap;
}

.answer-panel {
  display: grid;
  gap: 12px;
}

@media (max-width: 960px) {
  .answer-layout {
    grid-template-columns: 1fr;
  }
}
</style>
