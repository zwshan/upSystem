<script setup lang="ts">
import { useReviewStore } from '@/stores/review'

const store = useReviewStore()
</script>

<template>
  <section class="layout">
    <article class="card summary" data-testid="review-center-summary">
      <p class="eyebrow">Review Snapshot</p>
      <h2 class="section-title">复习中心</h2>
      <div class="metrics">
        <p><span>今日待复习</span><strong class="value-number">{{ store.dueToday }}</strong></p>
        <p><span>逾期条目</span><strong class="value-number overdue">{{ store.overdue }}</strong></p>
      </div>
    </article>

    <article class="card list">
      <h3>复习队列</h3>
      <ul>
        <li v-for="card in store.cards" :key="card.id">
          <div>
            <strong>{{ card.title }}</strong>
            <p>{{ card.dueAt }}</p>
          </div>
          <button type="button" class="btn btn-ghost">进入复习</button>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  gap: 12px;
}

.summary,
.list {
  padding: 18px;
}

.metrics {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metrics p {
  margin: 0;
  border: 1px solid var(--stroke-soft);
  border-radius: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.52);
  display: grid;
  gap: 6px;
}

.metrics span {
  color: var(--text-secondary);
  font-size: 13px;
}

.metrics strong {
  font-size: 30px;
}

.overdue {
  color: var(--danger);
}

.list h3 {
  font-size: 18px;
  letter-spacing: -0.02em;
}

ul {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

li {
  border: 1px solid var(--stroke-soft);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.56);
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

li p {
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 13px;
}

@media (max-width: 720px) {
  .metrics {
    grid-template-columns: 1fr;
  }

  li {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
