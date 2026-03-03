import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getRepositories } from '@/repositories/factory'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref(getRepositories().notes.getNotes())
  const activeNoteId = ref<number>(notes.value[0]?.id ?? 0)
  const activeNote = computed(() => notes.value.find((item) => item.id === activeNoteId.value))

  function setActive(id: number) {
    activeNoteId.value = id
  }

  return {
    activeNote,
    activeNoteId,
    notes,
    setActive,
  }
})
