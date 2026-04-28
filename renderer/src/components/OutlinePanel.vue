<script setup lang="ts">
import { GitMerge, Plus, Sparkles } from 'lucide-vue-next'
import { NButton } from 'naive-ui'
import PanelFrame from '@/components/PanelFrame.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <PanelFrame title="大纲规划">
    <template #title>
      <span class="title-with-icon">
        <GitMerge :size="18" />
        大纲规划
      </span>
    </template>

    <template #actions>
      <n-button round strong>
        <template #icon>
          <Sparkles :size="16" />
        </template>
        AI 扩写大纲
      </n-button>
    </template>

    <div class="outline-wrap">
      <div class="volume-title">第一卷：霓虹下的老鼠 (目标字数: 5万字)</div>
      <div class="outline-list">
        <article v-for="item in appStore.outlineItems" :key="item.id" class="outline-item">
          <div class="outline-header">
            <span>{{ item.title }}</span>
            <span class="outline-word">{{ item.wordTarget }}</span>
          </div>
          <div class="outline-desc">
            <b>核心冲突：</b>{{ item.conflict }}<br />
            <b>剧情：</b>{{ item.summary }}
          </div>
        </article>
        <div class="outline-add">
          <Plus :size="16" />
          <span>新增章节节点</span>
        </div>
      </div>
    </div>
  </PanelFrame>
</template>

<style scoped>
.title-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.outline-wrap {
  max-width: 800px;
  margin: 0 auto;
}

.volume-title {
  margin: 24px 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.outline-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--arc-border);
  border-radius: var(--arc-radius-md);
  background: var(--arc-bg-surface);
  box-shadow: var(--arc-shadow-sm);
  padding: 16px 20px;
}

.outline-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
}

.outline-word {
  color: var(--arc-text-secondary);
  font-size: 12px;
  font-weight: 400;
}

.outline-desc {
  border-radius: var(--arc-radius-sm);
  background: var(--arc-bg-surface-hover);
  color: var(--arc-text-secondary);
  font-size: 13px;
  line-height: 1.7;
  padding: 12px;
}

.outline-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed var(--arc-border);
  border-radius: var(--arc-radius-md);
  background: transparent;
  color: var(--arc-text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 18px 20px;
}
</style>
