<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Search, Sparkles, Users } from 'lucide-vue-next'
import { NButton, NInput, NTag } from 'naive-ui'
import PanelFrame from '@/components/PanelFrame.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const keyword = ref('')

const filteredCharacters = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) {
    return appStore.characters
  }

  return appStore.characters.filter((character) => {
    const haystack = [character.name, character.role, character.description].join(' ').toLowerCase()
    return haystack.includes(value)
  })
})

function tagType(tone?: 'default' | 'danger' | 'success' | 'warning'): 'default' | 'error' | 'success' | 'warning' {
  switch (tone) {
    case 'danger':
      return 'error'
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    default:
      return 'default'
  }
}
</script>

<template>
  <PanelFrame title="角色图鉴">
    <template #title>
      <span class="title-with-icon">
        <Users :size="18" />
        角色图鉴
      </span>
    </template>

    <template #actions>
      <n-input v-model:value="keyword" placeholder="搜索角色..." class="search-input">
        <template #prefix>
          <Search :size="16" />
        </template>
      </n-input>
      <n-button round strong>
        <template #icon>
          <Sparkles :size="16" />
        </template>
        AI生成角色
      </n-button>
      <n-button type="primary" round strong>
        <template #icon>
          <Plus :size="16" />
        </template>
        新建
      </n-button>
    </template>

    <div class="character-grid">
      <article v-for="character in filteredCharacters" :key="character.id" class="character-card">
        <div class="avatar" :style="{ background: character.avatar }"></div>
        <div class="character-info">
          <h3>{{ character.name }}<span v-if="character.role"> ({{ character.role }})</span></h3>
          <div class="tag-row">
            <n-tag
              v-for="tag in character.tags"
              :key="tag.label"
              round
              size="small"
              :type="tagType(tag.tone)"
            >
              {{ tag.label }}
            </n-tag>
          </div>
          <p class="description">{{ character.description }}</p>
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

.search-input {
  width: 220px;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.character-card {
  display: flex;
  gap: 16px;
  border: 1px solid var(--arc-border);
  border-radius: var(--arc-radius-lg);
  background: var(--arc-bg-surface);
  box-shadow: var(--arc-shadow-sm);
  padding: 20px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--arc-shadow-md);
}

.avatar {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 999px;
}

.character-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.description {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--arc-text-secondary);
  font-size: 13px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
