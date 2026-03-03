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
  padding: 8px 10px;
}

tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background: rgba(10, 132, 255, 0.06);
}

.text-btn {
  appearance: none;
  border: 1px solid var(--stroke-soft);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #0a56a5;
  cursor: pointer;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
}

.text-btn:hover {
  border-color: rgba(10, 132, 255, 0.28);
  background: rgba(10, 132, 255, 0.1);
}
</style>
