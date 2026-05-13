import type { AppSettings } from './shared-types'
import { normalizeSettings } from './settings'

const EMBEDDING_DIMENSION = 1024
const MAX_BATCH_SIZE = 16
const EMBEDDING_MODEL_FALLBACKS = ['text-embedding-3-small', 'text-embedding-ada-002', 'embedding-2']

export { EMBEDDING_DIMENSION }

export async function embedTexts(
  settings: AppSettings,
  texts: string[]
): Promise<Float32Array[]> {
  if (!texts.length) return []

  const normalized = normalizeSettings(settings)
  const baseUrl = (normalized.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const apiKey = normalized.apiKey

  const results: Float32Array[] = []
  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE)
    const batchResults = await requestEmbeddings(baseUrl, apiKey, batch, normalized.model)
    results.push(...batchResults)
  }
  return results
}

export async function embedText(settings: AppSettings, text: string): Promise<Float32Array> {
  const results = await embedTexts(settings, [text])
  return results[0]
}

async function requestEmbeddings(
  baseUrl: string,
  apiKey: string,
  inputs: string[],
  chatModel: string
): Promise<Float32Array[]> {
  const embeddingModel = resolveEmbeddingModel(chatModel)
  const url = `${baseUrl}/embeddings`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: embeddingModel,
      input: inputs,
      encoding_format: 'float'
    })
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Embedding API error ${response.status}: ${errorText.slice(0, 200)}`)
  }

  const json = await response.json() as {
    data?: Array<{ embedding: number[]; index: number }>
  }

  if (!json.data?.length) {
    throw new Error('Embedding API returned empty data')
  }

  const sorted = json.data.sort((a, b) => a.index - b.index)
  return sorted.map((item) => {
    const vec = new Float32Array(item.embedding.length)
    for (let i = 0; i < item.embedding.length; i++) {
      vec[i] = item.embedding[i]
    }
    return vec
  })
}

function resolveEmbeddingModel(chatModel: string): string {
  const lower = chatModel.toLowerCase()
  if (lower.includes('deepseek')) return 'text-embedding-3-small'
  if (lower.includes('qwen')) return 'text-embedding-v3'
  if (lower.includes('glm') || lower.includes('zhipu')) return 'embedding-3'
  return EMBEDDING_MODEL_FALLBACKS[0]
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  const len = Math.min(a.length, b.length)
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

export function splitTextIntoSegments(text: string, maxChars = 500): string[] {
  if (!text || text.length <= maxChars) return text ? [text] : []

  const paragraphs = text.split(/\n{2,}/)
  const segments: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxChars && current) {
      segments.push(current.trim())
      current = ''
    }
    current += (current ? '\n\n' : '') + para
  }
  if (current.trim()) {
    segments.push(current.trim())
  }

  return segments.filter((s) => s.length >= 20)
}
