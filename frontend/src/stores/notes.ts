import { defineStore } from 'pinia'
import { ref } from 'vue'

type NoteItem = {
  id: number
  title: string
  content: string
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<NoteItem[]>([
    { id: 1, title: '归纳概括答题框架', content: '1. 定义问题\n2. 归纳原因\n3. 对策建议' },
    { id: 2, title: '讲话稿开头模板', content: '各位同志，今天我们围绕...展开。' },
  ])

  const activeNoteId = ref<number>(notes.value[0]?.id ?? 0)

  const activeNote = ref<NoteItem | undefined>(notes.value.find((item) => item.id === activeNoteId.value))

  function setActive(id: number) {
    activeNoteId.value = id
    activeNote.value = notes.value.find((item) => item.id === id)
  }

  return {
    activeNote,
    activeNoteId,
    notes,
    setActive,
  }
})
