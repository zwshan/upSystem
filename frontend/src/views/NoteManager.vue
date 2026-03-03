<script setup lang="ts">
import { useNotesStore } from '@/stores/notes'

const store = useNotesStore()
</script>

<template>
  <section class="layout">
    <article class="card note-list">
      <h2>知识点笔记</h2>
      <ul>
        <li v-for="note in store.notes" :key="note.id">
          <button type="button" @click="store.setActive(note.id)">{{ note.title }}</button>
        </li>
      </ul>
    </article>

    <article class="card editor">
      <h3>{{ store.activeNote?.title }}</h3>
      <textarea :value="store.activeNote?.content" rows="10" />
    </article>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 2fr;
}

.note-list,
.editor {
  padding: 16px;
}

ul {
  margin: 8px 0 0;
  padding-left: 0;
}

li {
  list-style: none;
  margin-bottom: 6px;
}

button {
  background: #eef4ff;
  border: 1px solid #cfe0ff;
  border-radius: 8px;
  cursor: pointer;
  padding: 6px 8px;
}

textarea {
  margin-top: 8px;
  width: 100%;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
