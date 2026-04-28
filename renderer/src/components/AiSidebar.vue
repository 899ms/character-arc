<script setup lang="ts">
import { ref } from 'vue'
import { Send, Sparkles, X } from 'lucide-vue-next'
import { NButton, NInput, NTag } from 'naive-ui'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const draft = ref('')
const quickPrompts = ['帮我描写一下外面的酸雨环境', '分析这段逻辑']

function buildMockReply(prompt: string): string {
  if (prompt.includes('逻辑')) {
    return '当前段落的有效点在于“意外事件打断日常”，逻辑是通顺的。建议再补一层李雷为什么没有立刻报警或离开的心理动机，这样会让后续收留艾达更自然。'
  }

  return '巷子外的霓虹灯招牌在酸雨中闪烁不定，红蓝交织的光晕像一层浮油漂在水洼表面。空气里弥漫着臭氧与下水道发酵后的湿腥味，远处失真的广告女声被雨幕拉成断续的电流噪点。'
}

function sendPrompt(content: string): void {
  const prompt = content.trim()
  if (!prompt) {
    return
  }

  appStore.pushUserMessage(prompt)
  draft.value = ''

  window.setTimeout(() => {
    appStore.pushAssistantMessage(buildMockReply(prompt))
  }, 240)
}

function onQuickPrompt(prompt: string): void {
  draft.value = prompt
  sendPrompt(prompt)
}
</script>

<template>
  <aside class="ai-sidebar">
    <header class="ai-header">
      <div class="ai-title">
        <Sparkles :size="18" />
        <span>创作助理</span>
      </div>
      <button class="icon-button" @click="appStore.toggleAi()">
        <X :size="16" />
      </button>
    </header>

    <div class="chat-history arc-scrollbar">
      <div
        v-for="message in appStore.messages"
        :key="message.id"
        class="chat-msg"
        :class="message.role"
      >
        <div>{{ message.content }}</div>
        <n-button
          v-if="message.role === 'assistant'"
          text
          type="primary"
          class="insert-button"
          @click="appStore.insertIntoChapter(message.content)"
        >
          插入光标位置
        </n-button>
      </div>

      <div class="quick-tags">
        <n-tag
          v-for="prompt in quickPrompts"
          :key="prompt"
          round
          class="quick-tag"
          @click="onQuickPrompt(prompt)"
        >
          {{ prompt.includes('逻辑') ? '分析逻辑' : '描写环境' }}
        </n-tag>
      </div>
    </div>

    <footer class="ai-input-wrap">
      <div class="input-shell">
        <n-input
          v-model:value="draft"
          type="textarea"
          placeholder="输入要求，按 Enter 发送..."
          :autosize="{ minRows: 2, maxRows: 4 }"
          @keydown.enter.exact.prevent="sendPrompt(draft)"
        />
        <button class="send-button" @click="sendPrompt(draft)">
          <Send :size="18" />
        </button>
      </div>
    </footer>
  </aside>
</template>

<style scoped>
.ai-sidebar {
  display: flex;
  width: 320px;
  flex-direction: column;
  border-left: 1px solid var(--arc-border);
  background: var(--arc-bg-surface);
}

.ai-header {
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--arc-border);
  padding: 0 20px;
}

.ai-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--arc-text-primary);
}

.ai-title :deep(svg) {
  color: var(--arc-primary);
}

.chat-history {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 20px;
}

.chat-msg {
  max-width: 90%;
  border-radius: var(--arc-radius-md);
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
}

.chat-msg.user {
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  background: var(--arc-primary);
  color: white;
}

.chat-msg.assistant {
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  background: var(--arc-bg-surface-hover);
  color: var(--arc-text-primary);
}

.insert-button {
  margin-top: 10px;
}

.quick-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-tag {
  cursor: pointer;
  user-select: none;
}

.ai-input-wrap {
  border-top: 1px solid var(--arc-border);
  padding: 16px;
}

.input-shell {
  position: relative;
}

.send-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: inline-flex;
  border: none;
  background: transparent;
  color: var(--arc-primary);
  cursor: pointer;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: var(--arc-bg-surface-hover);
  color: var(--arc-text-secondary);
  cursor: pointer;
}
</style>
