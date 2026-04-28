<script setup lang="ts">
import { Library, Plus } from 'lucide-vue-next'
import { NButton } from 'naive-ui'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <section class="project-center">
    <header class="topbar">
      <div class="topbar-title">
        <Library :size="18" />
        <span>项目中心</span>
      </div>
      <n-button type="primary" round strong @click="appStore.openWizard()">
        <template #icon>
          <Plus :size="16" />
        </template>
        新建项目
      </n-button>
    </header>

    <main class="project-grid arc-scrollbar">
      <article
        v-for="project in appStore.projects"
        :key="project.id"
        class="project-card"
        @click="appStore.openProject(project.id)"
      >
        <div class="project-cover" :style="{ background: project.cover }"></div>
        <div class="project-title">{{ project.title }}</div>
        <div class="project-meta">{{ project.genre }} · {{ project.wordCount }}</div>
        <div class="project-meta">{{ project.lastEdited }}</div>
      </article>
    </main>
  </section>
</template>

<style scoped>
.project-center {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.topbar {
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--arc-border);
  background: rgba(255, 255, 255, 0.82);
  padding: 0 32px;
  backdrop-filter: blur(20px);
}

.topbar-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.project-grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  overflow-y: auto;
  padding: 32px;
}

.project-card {
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: var(--arc-radius-lg);
  background: var(--arc-bg-surface);
  box-shadow: var(--arc-shadow-sm);
  padding: 20px;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  border-color: var(--arc-border);
  box-shadow: var(--arc-shadow-md);
}

.project-cover {
  height: 120px;
  border-radius: var(--arc-radius-md);
  margin-bottom: 16px;
}

.project-title {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
}

.project-meta {
  color: var(--arc-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}
</style>
