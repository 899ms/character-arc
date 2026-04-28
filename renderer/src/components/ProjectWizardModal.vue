<script setup lang="ts">
import { reactive } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import {
  NButton,
  NCheckbox,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect
} from 'naive-ui'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const form = reactive({
  title: '新书草案',
  genre: '科幻未来',
  wordCount: '50-100万字',
  idea: '',
  autoGenerate: true
})

function submit(): void {
  appStore.createProject({
    title: form.title,
    genre: form.genre,
    wordCount: form.wordCount
  })
}
</script>

<template>
  <n-modal
    :show="appStore.wizardVisible"
    preset="card"
    title="新建项目向导"
    class="wizard-modal"
    :bordered="false"
    :mask-closable="false"
    @close="appStore.closeWizard()"
  >
    <n-form label-placement="top">
      <n-form-item label="作品标题">
        <n-input v-model:value="form.title" placeholder="例如：深渊凝视者" />
      </n-form-item>

      <div class="double-row">
        <n-form-item label="题材分类">
          <n-select
            v-model:value="form.genre"
            :options="[
              { label: '科幻未来', value: '科幻未来' },
              { label: '奇幻魔法', value: '奇幻魔法' },
              { label: '都市悬疑', value: '都市悬疑' }
            ]"
          />
        </n-form-item>
        <n-form-item label="目标字数">
          <n-select
            v-model:value="form.wordCount"
            :options="[
              { label: '50-100万字', value: '50-100万字' },
              { label: '中短篇', value: '中短篇' }
            ]"
          />
        </n-form-item>
      </div>

      <n-form-item label="核心点子 / 简介 (AI 将根据此生成大纲)">
        <n-input
          v-model:value="form.idea"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
          placeholder="描述一下你的故事核心..."
        />
      </n-form-item>

      <n-checkbox v-model:checked="form.autoGenerate">
        自动调用 AI 生成初始世界观与大纲
      </n-checkbox>
    </n-form>

    <template #footer>
      <div class="footer-actions">
        <n-button round strong @click="appStore.closeWizard()">取消</n-button>
        <n-button type="primary" round strong @click="submit">
          <template #icon>
            <ArrowRight :size="14" />
          </template>
          创建项目
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.wizard-modal {
  width: 560px;
  border-radius: var(--arc-radius-lg);
}

.double-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
