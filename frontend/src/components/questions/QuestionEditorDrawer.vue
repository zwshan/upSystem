<script setup lang="ts">
import { computed } from 'vue'

import type { QuestionItem } from '@/domain/types'

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
    <header class="drawer-header">
      <div>
        <p class="eyebrow">Editor</p>
        <h3>{{ drawerTitle }}</h3>
      </div>
      <button type="button" class="btn btn-ghost" @click="emit('close')">关闭</button>
    </header>

    <p class="desc">MVP 阶段仅实现前端状态，后续接入后端保存。</p>
  </aside>
</template>

<style scoped>
.drawer {
  margin-top: 2px;
  padding: 16px;
  display: grid;
  gap: 10px;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
}

h3 {
  margin-top: 4px;
  font-size: 20px;
  letter-spacing: -0.02em;
}

.desc {
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
