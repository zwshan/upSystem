<script setup lang="ts">
import { useReviewStore } from '@/stores/review'

const store = useReviewStore()
</script>

<template>
  <section class="layout">
    <article class="card summary" data-testid="review-center-summary">
      <h2>复习中心</h2>
      <p>今日待复习：{{ store.dueToday }}</p>
      <p>逾期：{{ store.overdue }}</p>
    </article>

    <article class="card list">
      <h3>复习队列</h3>
      <ul>
        <li v-for="card in store.cards" :key="card.id">
          {{ card.title }} · {{ card.dueAt }}
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
  padding: 16px;
}

p {
  margin: 8px 0 0;
}

ul {
  margin: 8px 0 0;
  padding-left: 20px;
}
</style>
