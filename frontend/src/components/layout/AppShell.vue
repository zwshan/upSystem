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
      <div class="brand-wrap">
        <p class="brand-mark">up</p>
        <div>
          <h1 class="brand">upSystem</h1>
          <p class="brand-sub">遴选复习工作台</p>
        </div>
      </div>

      <nav aria-label="Primary" class="primary-nav">
        <RouterLink
          v-for="item in primaryNavItems"
          :key="item.to"
          :to="item.to"
          data-testid="primary-nav-item"
          class="nav-item"
        >
          <span class="dot" aria-hidden="true"></span>
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
  max-width: var(--content-width);
  margin: 0 auto;
  min-height: 100vh;
  padding: 18px;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
}

.sidebar {
  padding: 18px 14px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 20px;
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(155deg, #111722, #273956);
  color: #fff;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.brand {
  font-size: 21px;
  letter-spacing: -0.03em;
}

.brand-sub {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 12px;
}

.primary-nav {
  display: grid;
  align-content: start;
  gap: 6px;
}

.nav-item {
  min-height: 40px;
  border-radius: 12px;
  color: var(--text-primary);
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 550;
  display: flex;
  align-items: center;
  gap: 9px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(20, 24, 35, 0.2);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.62);
}

.nav-item.router-link-active {
  background: var(--accent-soft);
  color: #0a56a5;
}

.nav-item.router-link-active .dot {
  background: var(--accent-strong);
  transform: scale(1.2);
}

.content {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
}

.view-host {
  padding: 20px;
  animation: fade-up 0.38s ease both;
}

@media (max-width: 1080px) {
  .app-shell {
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .sidebar {
    gap: 14px;
    padding: 14px;
  }

  .primary-nav {
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .nav-item {
    white-space: nowrap;
  }

  .view-host {
    padding: 16px;
  }
}
</style>
