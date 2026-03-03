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
    <strong>{{ formatted }}</strong>
    <div>
      <button type="button" @click="emit('start')">开始</button>
      <button type="button" @click="emit('pause')">暂停</button>
      <button type="button" @click="emit('reset')">重置</button>
    </div>
  </div>
</template>

<style scoped>
.timer {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

button {
  margin-left: 6px;
}
</style>
