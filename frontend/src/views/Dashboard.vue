<script setup lang="ts">
import CountdownCard from '@/components/dashboard/CountdownCard.vue'
import ReviewCard from '@/components/dashboard/ReviewCard.vue'
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
</script>

<template>
  <section class="dashboard-grid">
    <article class="card headline">
      <p class="eyebrow">Mission Control</p>
      <h2 class="section-title">今天保持一次完整作答 + 一次复盘</h2>
      <p class="headline-copy">用固定节奏做训练，复盘和错题归档都在一个工作台里完成。</p>
      <div class="quick-links">
        <RouterLink to="/exam-simulation" class="btn btn-primary">开始套题仿真</RouterLink>
        <RouterLink to="/review-center" class="btn btn-ghost">进入复习中心</RouterLink>
        <RouterLink to="/question-manager" class="btn btn-ghost">管理题目库</RouterLink>
      </div>
    </article>

    <CountdownCard
      :name="store.countdown.name"
      :target-date="store.countdown.targetDate"
      :days-left="store.countdown.daysLeft"
    />
    <ReviewCard
      :due-today="store.review.dueToday"
      :overdue="store.review.overdue"
    />
  </section>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.headline {
  grid-column: 1 / -1;
  padding: 20px;
  display: grid;
  gap: 10px;
}

.headline-copy {
  color: var(--text-secondary);
  max-width: 560px;
  line-height: 1.6;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 4px;
}

@media (max-width: 920px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
