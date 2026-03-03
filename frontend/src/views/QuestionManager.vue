<script setup lang="ts">
import QuestionEditorDrawer from '@/components/questions/QuestionEditorDrawer.vue'
import QuestionTable from '@/components/questions/QuestionTable.vue'
import { useQuestionsStore } from '@/stores/questions'

const store = useQuestionsStore()
const categoryOptions = ['全部', '案例分析', '公文写作', '策论文']
</script>

<template>
  <section class="layout">
    <header class="toolbar card">
      <div class="filter-wrap">
        <p class="eyebrow">Question Library</p>
        <label class="filter-label">
          题型筛选
          <select v-model="store.categoryFilter" data-testid="category-filter">
            <option v-for="option in categoryOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </label>
      </div>

      <button type="button" class="btn btn-primary" @click="store.openCreateDrawer">
        新建题目
      </button>
    </header>

    <QuestionTable :items="store.filteredQuestions" @edit="store.openEditDrawer" />

    <QuestionEditorDrawer
      :open="store.drawerOpen"
      :question="store.activeQuestion"
      @close="store.closeDrawer"
    />
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  gap: 12px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 14px;
  padding: 16px;
}

.filter-wrap {
  display: grid;
  gap: 6px;
}

.filter-label {
  display: grid;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

@media (max-width: 760px) {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
