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
      <label>
        题型筛选
        <select v-model="store.categoryFilter" data-testid="category-filter">
          <option v-for="option in categoryOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
      <button type="button" class="primary-btn" @click="store.openCreateDrawer">
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
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 12px;
}

select {
  margin-left: 8px;
}

.primary-btn {
  background: var(--accent-strong);
  border: 0;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  padding: 8px 12px;
}
</style>
