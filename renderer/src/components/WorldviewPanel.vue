<script setup lang="ts">
import { Edit3, Globe, Plus } from 'lucide-vue-next'
import { NButton } from 'naive-ui'
import PanelFrame from '@/components/PanelFrame.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <PanelFrame title="世界观设定">
    <template #title>
      <span class="title-with-icon">
        <Globe :size="18" />
        世界观设定
      </span>
    </template>

    <template #actions>
      <n-button type="primary" round strong>
        <template #icon>
          <Plus :size="16" />
        </template>
        新增条目
      </n-button>
    </template>

    <div class="world-grid">
      <article v-for="entry in appStore.worldviewEntries" :key="entry.id" class="world-card">
        <div class="card-title">
          <span>{{ entry.title }}</span>
          <button class="icon-button">
            <Edit3 :size="14" />
          </button>
        </div>
        <div class="card-content">
          {{ entry.content }}
        </div>
      </article>
    </div>
  </PanelFrame>
</template>

<style scoped>
.title-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.world-grid {
  display: grid;
  gap: 20px;
}

.world-card {
  border: 1px solid var(--arc-border);
  border-radius: var(--arc-radius-lg);
  background: var(--arc-bg-surface);
  box-shadow: var(--arc-shadow-sm);
  padding: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.card-content {
  color: #444;
  font-size: 14px;
  line-height: 1.7;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: var(--arc-bg-surface-hover);
  color: var(--arc-text-secondary);
  cursor: pointer;
}
</style>
