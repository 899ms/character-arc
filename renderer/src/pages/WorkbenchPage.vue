<script setup lang="ts">
import { computed } from 'vue'
import {
  Bot,
  Globe,
  GitMerge,
  Home,
  Settings,
  Users
} from 'lucide-vue-next'
import { NButton } from 'naive-ui'
import { useAppStore } from '@/stores/app'
import WorldviewPanel from '@/components/WorldviewPanel.vue'
import CharactersPanel from '@/components/CharactersPanel.vue'
import OutlinePanel from '@/components/OutlinePanel.vue'
import EditorPanel from '@/components/EditorPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import AiSidebar from '@/components/AiSidebar.vue'

const appStore = useAppStore()

const panels = [
  { key: 'worldview', label: '世界观管理', icon: Globe },
  { key: 'characters', label: '角色管理', icon: Users },
  { key: 'outline', label: '大纲规划', icon: GitMerge }
] as const

const activeChapterItems = computed(() => appStore.chapters)
</script>

<template>
  <section class="workbench">
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="project-name">{{ appStore.currentProject?.title ?? '未命名项目' }}</span>
        <button class="icon-button" @click="appStore.backToProjects()">
          <Home :size="16" />
        </button>
      </div>

      <div class="nav-list">
        <button
          v-for="panel in panels"
          :key="panel.key"
          class="sidebar-item"
          :class="{ active: appStore.activePanel === panel.key }"
          @click="appStore.setPanel(panel.key)"
        >
          <component :is="panel.icon" :size="18" />
          <span>{{ panel.label }}</span>
        </button>
      </div>

      <div class="section-label">正文创作</div>

      <div class="chapter-list arc-scrollbar">
        <button
          v-for="chapter in activeChapterItems"
          :key="chapter.id"
          class="chapter-item"
          :class="{ active: appStore.selectedChapterId === chapter.id }"
          @click="appStore.selectChapter(chapter.id)"
        >
          {{ chapter.title }}
        </button>
      </div>

      <div class="footer-nav">
        <button
          class="sidebar-item"
          :class="{ active: appStore.activePanel === 'settings' }"
          @click="appStore.setPanel('settings')"
        >
          <Settings :size="18" />
          <span>项目设置</span>
        </button>
      </div>
    </aside>

    <section class="main-container">
      <WorldviewPanel v-if="appStore.activePanel === 'worldview'" />
      <CharactersPanel v-else-if="appStore.activePanel === 'characters'" />
      <OutlinePanel v-else-if="appStore.activePanel === 'outline'" />
      <SettingsPanel v-else-if="appStore.activePanel === 'settings'" />
      <EditorPanel v-else />
    </section>

    <AiSidebar v-if="appStore.aiVisible" />

    <div v-else class="ai-toggle-wrap">
      <n-button type="primary" circle secondary @click="appStore.toggleAi()">
        <template #icon>
          <Bot :size="18" />
        </template>
      </n-button>
    </div>
  </section>
</template>

<style scoped>
.workbench {
  display: flex;
  width: 100%;
  height: 100%;
}

.sidebar {
  display: flex;
  width: 240px;
  flex-direction: column;
  border-right: 1px solid var(--arc-border);
  background: var(--arc-bg-surface);
  padding: 16px 12px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 24px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
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

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border: none;
  border-radius: var(--arc-radius-md);
  background: transparent;
  color: var(--arc-text-secondary);
  cursor: pointer;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}

.sidebar-item:hover {
  background: var(--arc-bg-surface-hover);
  color: var(--arc-text-primary);
}

.sidebar-item.active {
  background: var(--arc-primary-soft);
  color: var(--arc-primary);
}

.section-label {
  margin: 24px 0 8px 12px;
  color: var(--arc-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.chapter-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: 16px;
  overflow-y: auto;
}

.chapter-item {
  position: relative;
  width: 100%;
  border: none;
  border-radius: var(--arc-radius-sm);
  background: transparent;
  color: var(--arc-text-secondary);
  cursor: pointer;
  padding: 8px 12px 8px 36px;
  font-size: 13px;
  text-align: left;
}

.chapter-item:hover {
  background: var(--arc-bg-surface-hover);
  color: var(--arc-text-primary);
}

.chapter-item.active {
  color: var(--arc-text-primary);
  font-weight: 600;
}

.chapter-item.active::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 13px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--arc-primary);
}

.footer-nav {
  margin-top: auto;
  border-top: 1px solid var(--arc-border);
  padding-top: 16px;
}

.main-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  background: var(--arc-bg-body);
}

.ai-toggle-wrap {
  display: flex;
  width: 64px;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--arc-border);
  background: var(--arc-bg-surface);
}
</style>
