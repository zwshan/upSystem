<script setup lang="ts">
import type { QuestionItem } from '@/domain/types'

const props = defineProps<{
  items: QuestionItem[]
}>()

const emit = defineEmits<{
  edit: [question: QuestionItem]
}>()
</script>

<template>
  <div class="table-wrap card" data-testid="question-table">
    <table>
      <thead>
        <tr>
          <th>年份</th>
          <th>来源</th>
          <th>题型</th>
          <th>字数</th>
          <th>分值</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in props.items"
          :key="item.id"
          data-testid="question-row"
        >
          <td>{{ item.year }}</td>
          <td>{{ item.source }}</td>
          <td>{{ item.category }} / {{ item.subType }}</td>
          <td>{{ item.wordLimit }}</td>
          <td>{{ item.score }}</td>
          <td>
            <button class="text-btn" type="button" @click="emit('edit', item)">
              编辑
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow: auto;
  padding: 8px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border-bottom: 1px solid #e7edf6;
  padding: 10px;
  text-align: left;
}

.text-btn {
  background: transparent;
  border: none;
  color: var(--accent-strong);
  cursor: pointer;
}
</style>
