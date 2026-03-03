<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    wordLimit: number
  }>(),
  {
    modelValue: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    inputValue.value = value
  },
)

watch(inputValue, (value) => {
  emit('update:modelValue', value)
})

const cells = computed(() => {
  const totalCells = 600
  const value = inputValue.value.slice(0, totalCells)

  return Array.from({ length: totalCells }, (_, index) => value[index] ?? '')
})

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  inputValue.value = target.value.slice(0, props.wordLimit)
}
</script>

<template>
  <section class="grid-paper" data-testid="grid-paper">
    <textarea
      class="hidden-input"
      :value="inputValue"
      @input="onInput"
      aria-label="answer-input"
      placeholder="在这里录入答案，方格将同步显示..."
    />

    <div class="grid">
      <span
        v-for="(cell, index) in cells"
        :key="index"
        class="cell"
        data-testid="grid-cell"
      >
        {{ cell }}
      </span>
    </div>

    <p class="counter">{{ inputValue.length }} / {{ props.wordLimit }}</p>
  </section>
</template>

<style scoped>
.grid-paper {
  display: grid;
  gap: 10px;
}

.hidden-input {
  min-height: 110px;
  resize: vertical;
}

.grid {
  border: 1px solid var(--stroke-soft);
  border-radius: 10px;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(25, minmax(0, 1fr));
  background: #fff;
}

.cell {
  border-right: 1px solid rgba(16, 24, 40, 0.06);
  border-bottom: 1px solid rgba(16, 24, 40, 0.06);
  height: 22px;
  line-height: 22px;
  text-align: center;
  font-size: 12px;
  color: #2a3446;
}

.counter {
  color: var(--text-secondary);
  text-align: right;
  font-size: 13px;
}
</style>
