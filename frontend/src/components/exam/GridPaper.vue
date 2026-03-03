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
  width: 100%;
}

.grid {
  border: 1px solid #dce5f2;
  display: grid;
  grid-template-columns: repeat(25, minmax(0, 1fr));
}

.cell {
  border-bottom: 1px solid #edf2f9;
  border-right: 1px solid #edf2f9;
  font-size: 12px;
  height: 22px;
  line-height: 22px;
  text-align: center;
}

.counter {
  color: var(--text-muted);
  margin: 0;
  text-align: right;
}
</style>
