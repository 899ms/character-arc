<script setup lang="ts">
import { Bot, History, Save } from 'lucide-vue-next'
import { NButton } from 'naive-ui'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <section class="editor-panel">
    <header class="editor-header">
      <div class="editor-meta">正文 / 第一卷 / {{ appStore.selectedChapter?.title }}</div>
      <div class="editor-actions">
        <n-button round strong>
          <template #icon>
            <History :size="16" />
          </template>
          历史版本
        </n-button>
        <n-button round strong @click="appStore.toggleAi()">
          <template #icon>
            <Bot :size="16" />
          </template>
          {{ appStore.aiVisible ? '隐藏 AI' : '唤起 AI' }}
        </n-button>
        <n-button type="primary" round strong>
          <template #icon>
            <Save :size="16" />
          </template>
          手动保存
        </n-button>
      </div>
    </header>

    <div class="editor-body arc-scrollbar">
      <div class="editor-wrap">
        <div class="editor-content">
          <input
            class="editor-title"
            :value="appStore.selectedChapter?.title"
            @input="appStore.updateChapterTitle(($event.target as HTMLInputElement).value)"
          />
          <textarea
            class="editor-text"
            :value="appStore.selectedChapter?.content"
            @input="appStore.updateChapterContent(($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.editor-panel {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.editor-header {
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--arc-border);
  background: var(--arc-bg-surface);
  padding: 0 32px;
}

.editor-meta {
  color: var(--arc-text-secondary);
  font-size: 14px;
}

.editor-actions {
  display: flex;
  gap: 12px;
}

.editor-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.editor-wrap {
  display: flex;
  justify-content: center;
  min-height: 100%;
  padding: 0 40px;
}

.editor-content {
  width: 100%;
  max-width: 760px;
  margin-top: 32px;
  border-radius: var(--arc-radius-lg) var(--arc-radius-lg) 0 0;
  background: var(--arc-bg-surface);
  box-shadow: var(--arc-shadow-md);
  padding: 60px 80px;
}

.editor-title {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--arc-text-primary);
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
}

.editor-text {
  width: 100%;
  min-height: 600px;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: #333;
  font-size: 16px;
  line-height: 1.85;
}
</style>
