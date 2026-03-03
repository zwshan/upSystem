<script setup lang="ts">
import { useNotesStore } from '@/stores/notes'

const store = useNotesStore()
</script>

<template>
  <section class="layout">
    <article class="card note-list">
      <p class="eyebrow">Knowledge Base</p>
      <h2 class="section-title">知识点笔记</h2>
      <ul>
        <li v-for="note in store.notes" :key="note.id">
          <button type="button" class="note-item" @click="store.setActive(note.id)">
            {{ note.title }}
          </button>
        </li>
      </ul>
    </article>

    <article class="card editor">
      <h3>{{ store.activeNote?.title }}</h3>
      <textarea :value="store.activeNote?.content" rows="12" />
      <div class="editor-footer">
        <button type="button" class="btn btn-primary">保存草稿</button>
        <button type="button" class="btn btn-ghost">导出</button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(220px, 1fr) 2fr;
}

.note-list,
.editor {
  padding: 18px;
}

.note-list ul {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.note-item {
  width: 100%;
  text-align: left;
  border: 1px solid var(--stroke-soft);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.68);
  min-height: 36px;
  padding: 8px 10px;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.note-item:hover {
  border-color: rgba(10, 132, 255, 0.3);
  transform: translateX(1px);
}

.editor {
  display: grid;
  gap: 10px;
}

.editor h3 {
  font-size: 20px;
  letter-spacing: -0.02em;
}

.editor-footer {
  display: flex;
  gap: 8px;
}

@media (max-width: 940px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
