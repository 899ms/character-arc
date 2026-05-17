<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NModal, NTag } from 'naive-ui'
import type { ChapterAuditPayload } from './useChapterFirstDraft'

const props = defineProps<{
  show: boolean
  isGenerating: boolean
  isStopping: boolean
  isAuditing: boolean
  executionLabel: string
  streamingContent: string
  progressPercent: number
  progressText: string
  auditResult: ChapterAuditPayload | null
}>()

defineEmits<{
  stop: []
  close: []
}>()

const severityType = (s: 'critical' | 'warning' | 'hint'): 'error' | 'warning' | 'info' => {
  if (s === 'critical') return 'error'
  if (s === 'warning') return 'warning'
  return 'info'
}

const severityLabel = (s: 'critical' | 'warning' | 'hint'): string => {
  if (s === 'critical') return '严重'
  if (s === 'warning') return '建议'
  return '提示'
}

const auditSummary = computed(() => {
  if (!props.auditResult) return ''
  const issues = props.auditResult.issues
  const critical = issues.filter((i) => i.severity === 'critical').length
  const warning = issues.filter((i) => i.severity === 'warning').length
  const hint = issues.filter((i) => i.severity === 'hint').length
  return `共 ${issues.length} 项：${critical} 严重 / ${warning} 建议 / ${hint} 提示`
})
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="AI 初稿执行中"
    :style="{ width: 'min(720px, 92vw)' }"
    :mask-closable="false"
    :closable="!isGenerating"
    :bordered="false"
    @close="$emit('close')"
  >
    <div class="card">
      <div class="head">
        <div class="copy-block">
          <span class="label">AI 初稿执行中</span>
          <strong>{{ executionLabel || '等待开始' }}</strong>
        </div>
        <span class="percent">
          {{ isGenerating ? `${progressPercent}%` : '已结束' }}
        </span>
      </div>
      <div class="track">
        <div class="fill" :style="{ width: `${progressPercent}%` }" />
      </div>
      <p class="copy">
        {{ progressText || '已停止或完成本次 AI 初稿生成。' }}
      </p>
      <div class="preview arc-scrollbar">
        <pre>{{ streamingContent || 'AI 正在准备本章初稿内容...' }}</pre>
      </div>

      <div v-if="isAuditing" class="audit-loading">
        正在对照写作备忘审计本章质量…
      </div>

      <div v-else-if="auditResult" class="audit-panel">
        <div class="audit-head">
          <n-tag :type="auditResult.pass ? 'success' : 'error'" size="small" round>
            {{ auditResult.pass ? '审计通过' : '审计未通过' }}
          </n-tag>
          <span class="audit-meta">{{ auditResult.wordCount }} 字 · {{ auditSummary }}</span>
        </div>
        <ul v-if="auditResult.issues.length > 0" class="audit-list arc-scrollbar">
          <li v-for="(issue, idx) in auditResult.issues" :key="idx" class="audit-item">
            <div class="audit-item-head">
              <n-tag :type="severityType(issue.severity)" size="tiny" round>
                {{ severityLabel(issue.severity) }}
              </n-tag>
              <span class="audit-category">{{ issue.category }}</span>
            </div>
            <div v-if="issue.ref" class="audit-ref">{{ issue.ref }}</div>
            <div class="audit-hint">{{ issue.hint }}</div>
          </li>
        </ul>
        <p v-else class="audit-empty">没有发现问题。</p>
      </div>
    </div>

    <template #footer>
      <div class="actions">
        <n-button
          v-if="isGenerating"
          round
          strong
          secondary
          type="warning"
          :loading="isStopping"
          @click="$emit('stop')"
        >
          停止生成
        </n-button>
        <n-button v-else round strong type="primary" @click="$emit('close')">
          关闭
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.copy-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 11px;
  color: var(--arc-text-hint);
  letter-spacing: 0.05em;
}

.copy-block strong {
  font-size: 14px;
  color: var(--arc-text-primary);
}

.percent {
  font-size: 14px;
  font-weight: 600;
  color: var(--arc-primary);
  font-variant-numeric: tabular-nums;
}

.track {
  height: 6px;
  background: var(--arc-bg-surface-hover);
  border-radius: 3px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, var(--arc-success), var(--arc-primary));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.copy {
  margin: 0;
  font-size: 12px;
  color: var(--arc-text-secondary);
  line-height: 1.6;
}

.preview {
  background: var(--arc-bg-weak);
  border: 1px solid var(--arc-border);
  border-radius: var(--arc-radius-md);
  padding: 12px 14px;
  max-height: 320px;
  overflow-y: auto;
}

.preview pre {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  color: var(--arc-text-primary);
  user-select: text;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.audit-loading {
  font-size: 12px;
  color: var(--arc-text-secondary);
  padding: 8px 0;
}

.audit-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--arc-border);
  padding-top: 12px;
}

.audit-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.audit-meta {
  font-size: 12px;
  color: var(--arc-text-secondary);
}

.audit-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.audit-item {
  background: var(--arc-bg-weak);
  border: 1px solid var(--arc-border);
  border-radius: var(--arc-radius-md);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.audit-item-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.audit-category {
  font-size: 11px;
  color: var(--arc-text-hint);
}

.audit-ref {
  font-size: 12px;
  color: var(--arc-text-secondary);
  font-style: italic;
}

.audit-hint {
  font-size: 13px;
  color: var(--arc-text-primary);
  line-height: 1.6;
}

.audit-empty {
  margin: 0;
  font-size: 12px;
  color: var(--arc-text-secondary);
}
</style>
