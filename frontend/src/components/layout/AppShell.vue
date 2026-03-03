<script setup lang="ts">
const primaryNavItems = [
  'Dashboard',
  'ExamSimulation',
  'TargetedPractice',
  'AnswerSheet',
  'QuestionManager',
  'ReviewCenter',
  'NoteManager',
  'Statistics',
  'Settings',
]
</script>

<template>
  <div class="app-shell">
    <nav aria-label="Primary">
      <a
        v-for="item in primaryNavItems"
        :key="item"
        href="#"
        data-testid="primary-nav-item"
      >
        {{ item }}
      </a>
    </nav>
    <main>
      <slot />
    </main>
  </div>
</template>
