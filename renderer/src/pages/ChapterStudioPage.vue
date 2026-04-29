<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, Search } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import ChaptersPanel from '@/components/ChaptersPanel.vue'

const appStore = useAppStore()
const searchKeyword = ref('')

const normalizedSearch = computed(() => searchKeyword.value.trim())
const currentChapterTitle = computed(() => appStore.selectedChapter?.title || '未命名章节')
const currentVolumeTitle = computed(() => appStore.selectedChapterVolume?.title || '未分卷')

watch(
  () => appStore.selectedChapterId,
  () => {
    searchKeyword.value = ''
  }
)
</script>

<template>
  <section class="chapter-studio-page">
    <main class="chapter-studio-main">
      <header class="studio-header arc-drag-region">
        <div class="studio-header-main">
          <button class="studio-back arc-no-drag" @click="appStore.backToWorkbench()">
            <ChevronLeft :size="18" />
            <span>返回工作台</span>
          </button>

          <div class="studio-title">
            <span class="studio-kicker">Independent Writing Mode</span>
            <strong>{{ currentChapterTitle }}</strong>
            <p>{{ appStore.currentProject?.title }} · {{ currentVolumeTitle }}</p>
          </div>
        </div>

        <div class="studio-tools arc-no-drag">
          <div class="studio-search">
            <Search :size="14" />
            <input v-model="searchKeyword" type="text" placeholder="筛选章节或摘要..." />
          </div>
        </div>
      </header>

      <div class="studio-body arc-scrollbar">
        <ChaptersPanel :search-query="normalizedSearch" />
      </div>
    </main>
  </section>
</template>

<style scoped>
.chapter-studio-page {
  display: flex;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background:
    linear-gradient(180deg, #f4f6fb, #f7f9fc 24%, #eef2f7 100%),
    radial-gradient(circle at top left, color-mix(in srgb, var(--arc-primary) 8%, white), transparent 24%),
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.82), transparent 22%);
}

.chapter-studio-main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.studio-header {
  position: sticky;
  top: 0;
  z-index: 14;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.88);
  background:
    linear-gradient(180deg, rgba(250, 252, 255, 0.9), rgba(244, 247, 252, 0.8));
  backdrop-filter: blur(22px);
  padding:
    calc(var(--arc-titlebar-height) + 14px)
    max(28px, calc(var(--arc-window-controls-width) + 22px))
    20px
    28px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.05);
}

.studio-header-main {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 18px;
}

.studio-back {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(226, 232, 240, 0.94);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  color: #475569;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  padding: 11px 15px;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.studio-back:hover {
  border-color: color-mix(in srgb, var(--arc-primary) 18%, white);
  background: rgba(255, 255, 255, 0.98);
  color: var(--arc-primary);
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.07);
}

.studio-title {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.studio-kicker {
  color: color-mix(in srgb, var(--arc-primary) 76%, white);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.studio-title strong {
  overflow: hidden;
  color: #111827;
  font-size: clamp(22px, 2.2vw, 30px);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.studio-title p {
  margin: 0;
  color: #667085;
  font-size: 13px;
}

.studio-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}

.studio-search {
  display: inline-flex;
  width: clamp(240px, 24vw, 340px);
  min-width: 220px;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.04);
  color: #94a3b8;
  padding: 12px 15px;
  transition:
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    background 0.24s ease;
}

.studio-search:focus-within {
  border-color: color-mix(in srgb, var(--arc-primary) 24%, white);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--arc-primary) 10%, transparent);
}

.studio-search input {
  width: 100%;
  border: none;
  background: transparent;
  color: #111827;
  font-size: 14px;
  outline: none;
}

.studio-search input::placeholder {
  color: #9ca3af;
}

.studio-body {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
  padding: clamp(22px, 2.4vw, 34px);
}

@media (max-width: 980px) {
  .studio-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .studio-tools,
  .studio-search {
    width: 100%;
  }
}

@media (max-width: 1360px) {
  .chapter-studio-main {
    min-height: 0;
  }
}

@media (max-width: 720px) {
  .studio-body {
    padding: 14px;
  }

  .studio-header {
    padding:
      calc(var(--arc-titlebar-height) + 10px)
      max(16px, calc(var(--arc-window-controls-width) + 14px))
      16px
      16px;
  }

  .studio-header-main {
    width: 100%;
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
