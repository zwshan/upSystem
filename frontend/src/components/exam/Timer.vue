<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  seconds: number
}>()

const emit = defineEmits<{
  start: []
  pause: []
  reset: []
}>()

const formatted = computed(() => {
  const minutes = Math.floor(props.seconds / 60)
  const seconds = props.seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
</script>

<template>
  <div class="timer" data-testid="timer">
    <div>
      <p class="eyebrow">Timer</p>
      <strong class="clock value-number">{{ formatted }}</strong>
    </div>

    <div class="actions">
      <button type="button" class="btn btn-ghost" @click="emit('start')">开始</button>
      <button type="button" class="btn btn-ghost" @click="emit('pause')">暂停</button>
      <button type="button" class="btn btn-ghost" @click="emit('reset')">重置</button>
    </div>
  </div>
</template>

<style scoped>
.timer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(16, 24, 40, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.5);
}

.clock {
  margin-top: 3px;
  display: inline-block;
  font-size: clamp(24px, 3vw, 30px);
  letter-spacing: -0.03em;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
