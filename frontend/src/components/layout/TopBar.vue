<script setup lang="ts">
import { computed, inject } from 'vue'
import { routeLocationKey } from 'vue-router'

const route = inject<{ name?: string } | undefined>(routeLocationKey, undefined)

const routeTitleMap: Record<string, string> = {
  dashboard: '首页总览',
  'exam-simulation': '套题仿真',
  'targeted-practice': '专项练习',
  'answer-sheet': '答题页',
  'question-manager': '题目管理',
  'review-center': '复习中心',
  'note-manager': '笔记管理',
  statistics: '统计看板',
  settings: '系统设置',
}

const title = computed(() => routeTitleMap[String(route?.name ?? '')] ?? '遴选复习系统')
const subtitle = computed(() => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${date} · Frontend First`
})
</script>

<template>
  <header class="top-bar card">
    <div>
      <p class="title">{{ title }}</p>
      <p class="subtitle">{{ subtitle }}</p>
    </div>

    <div class="status-strip">
      <span class="chip">Mock Data</span>
      <span class="chip chip-blue">Apple Minimal</span>
    </div>
  </header>
</template>

<style scoped>
.top-bar {
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.title {
  font-size: 18px;
  letter-spacing: -0.02em;
  font-weight: 640;
}

.subtitle {
  margin-top: 2px;
  font-size: 13px;
  color: var(--text-secondary);
}

.status-strip {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chip {
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--stroke-soft);
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.74);
}

.chip-blue {
  color: #0a56a5;
  border-color: rgba(10, 132, 255, 0.26);
  background: rgba(10, 132, 255, 0.12);
}

@media (max-width: 700px) {
  .status-strip {
    display: none;
  }
}
</style>
