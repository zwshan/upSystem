<script setup lang="ts">
import CountdownCard from '@/components/dashboard/CountdownCard.vue'
import ReviewCard from '@/components/dashboard/ReviewCard.vue'
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
</script>

<template>
  <section class="dashboard-grid">
    <CountdownCard
      :name="store.countdown.name"
      :target-date="store.countdown.targetDate"
      :days-left="store.countdown.daysLeft"
    />
    <ReviewCard
      :due-today="store.review.dueToday"
      :overdue="store.review.overdue"
    />
    <article class="card actions">
      <h3>快捷入口</h3>
      <div class="links">
        <RouterLink to="/exam-simulation">开始套题仿真</RouterLink>
        <RouterLink to="/review-center">进入复习中心</RouterLink>
        <RouterLink to="/question-manager">管理题目库</RouterLink>
      </div>
    </article>
  </section>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.actions {
  grid-column: 1 / -1;
  padding: 18px;
}

.actions h3 {
  margin: 0 0 12px;
}

.links {
  display: flex;
  gap: 14px;
}

.links a {
  color: var(--accent-strong);
  text-decoration: none;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
