<script setup lang="ts">
import { computed } from 'vue'

import type { QuestionItem } from '@/repositories/mock/questions.mock'

const props = defineProps<{
  open: boolean
  question: QuestionItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const drawerTitle = computed(() => (props.question ? '编辑题目' : '新建题目'))
</script>

<template>
  <aside v-if="props.open" class="drawer card" data-testid="question-editor-drawer">
    <header>
      <h3>{{ drawerTitle }}</h3>
      <button type="button" class="text-btn" @click="emit('close')">关闭</button>
    </header>
    <p class="desc">MVP 阶段仅实现前端状态，后续接入后端保存。</p>
  </aside>
</template>

<style scoped>
.drawer {
  margin-top: 12px;
  padding: 14px;
}

header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.desc {
  color: var(--text-muted);
  margin: 8px 0 0;
}

.text-btn {
  background: transparent;
  border: none;
  color: var(--accent-strong);
  cursor: pointer;
}
</style>
