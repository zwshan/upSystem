<script setup lang="ts">
import TopBar from '@/components/layout/TopBar.vue'

const primaryNavItems = [
  { name: '首页', to: '/' },
  { name: '套题仿真', to: '/exam-simulation' },
  { name: '专项练习', to: '/targeted-practice' },
  { name: '答题页', to: '/answer-sheet' },
  { name: '题目管理', to: '/question-manager' },
  { name: '复习中心', to: '/review-center' },
  { name: '笔记管理', to: '/note-manager' },
  { name: '统计看板', to: '/statistics' },
  { name: '系统设置', to: '/settings' },
]
</script>

<template>
  <div class="app-shell page-gradient">
    <aside class="sidebar card">
      <h1 class="brand">upSystem</h1>
      <nav aria-label="Primary" class="primary-nav">
        <RouterLink
        v-for="item in primaryNavItems"
        :key="item.to"
        :to="item.to"
        data-testid="primary-nav-item"
        class="nav-item"
      >
          {{ item.name }}
        </RouterLink>
      </nav>
    </aside>
    <section class="content">
      <TopBar />
      <main class="card view-host">
        <slot />
      </main>
    </section>
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
}

.sidebar {
  padding: 20px;
}

.brand {
  margin: 0 0 20px;
  font-size: 22px;
}

.primary-nav {
  display: grid;
  gap: 8px;
}

.nav-item {
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 10px 12px;
  text-decoration: none;
}

.nav-item:hover {
  background: rgba(30, 112, 226, 0.08);
}

.nav-item.router-link-active {
  background: rgba(30, 112, 226, 0.16);
  color: var(--accent-strong);
}

.content {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.view-host {
  padding: 20px;
}

@media (max-width: 920px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
}
</style>
