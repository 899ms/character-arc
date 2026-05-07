import type { AppSettings, AiStreamHandlers, PromptPair } from '../shared-types'
import type { StructuredOutputOptions } from './index'
import type {
  AgentMessage,
  AgentRequestParams,
  AgentResponse,
  AgentStopReason,
  AssistantContentBlock,
  AssistantToolUseBlock,
  ToolDefinition,
  ToolResultBlock
} from '../agent/tools/types'
import { performAiRequest, readErrorMessage } from './http'
import { consumeSseResponse, extractOpenAiCompatibleDelta } from './sse'

export async function requestOpenAiCompatible(
  settings: AppSettings,
  prompt: PromptPair,
  maxTokens?: number,
  structured?: StructuredOutputOptions
): Promise<string> {
  const body: Record<string, unknown> = {
    model: settings.model,
    temperature: 0.8,
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user }
    ]
  }
  if (maxTokens) body.max_tokens = maxTokens
  if (structured?.mode === 'json_object') {
    body.response_format = { type: 'json_object' }
  }
  const response = await performAiRequest(
    `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {})
      },
      body: JSON.stringify(body)
    },
    'OpenAI 兼容接口'
  )
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 返回内容为空')
  return content
}

export async function requestOpenAiCompatibleStream(
  settings: AppSettings,
  prompt: PromptPair,
  handlers: AiStreamHandlers,
  signal: AbortSignal,
  maxTokens?: number
): Promise<string> {
  const response = await fetch(
    `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {})
      },
      signal,
      body: JSON.stringify({
        model: settings.model,
        temperature: 0.8,
        stream: true,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ]
      })
    }
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'OpenAI 兼容接口'))
  }
  let content = ''
  await consumeSseResponse(response, (_eventName, data) => {
    if (!data || data === '[DONE]') return
    const payload = JSON.parse(data) as Record<string, unknown>
    const delta = extractOpenAiCompatibleDelta(payload)
    if (!delta) return
    content += delta
    handlers.onTextDelta(delta)
  })
  return content
}

// ---------------------------------------------------------------------------
// Tool-aware (agentic) request — non-streaming.
// Translates AgentMessage[] / ToolDefinition[] to Chat Completions `tools` /
// `tool_calls` and translates the response back into provider-neutral blocks.
// ---------------------------------------------------------------------------

export async function requestOpenAiCompatibleWithTools(
  settings: AppSettings,
  params: AgentRequestParams,
  signal?: AbortSignal
): Promise<AgentResponse> {
  const body: Record<string, unknown> = {
    model: settings.model,
    temperature: 0.8,
    messages: [
      { role: 'system', content: params.system },
      ...params.messages.flatMap(toOpenAiMessages)
    ],
    tools: params.tools.map(toOpenAiTool),
    tool_choice: 'auto'
  }
  if (params.maxTokens) body.max_tokens = params.maxTokens

  const response = await performAiRequest(
    `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {})
      },
      body: JSON.stringify(body)
    },
    'OpenAI 兼容接口',
    signal
  )

  const data = (await response.json()) as {
    choices?: Array<{
      finish_reason?: string
      message?: {
        content?: string | null
        tool_calls?: Array<{
          id?: string
          type?: string
          function?: { name?: string; arguments?: string }
        }>
      }
    }>
  }
  const choice = data.choices?.[0]
  const message = choice?.message ?? {}
  const blocks: AssistantContentBlock[] = []

  if (typeof message.content === 'string' && message.content.length > 0) {
    blocks.push({ type: 'text', text: message.content })
  }
  for (const call of message.tool_calls ?? []) {
    const block = fromOpenAiToolCall(call)
    if (block) blocks.push(block)
  }

  return {
    stopReason: mapOpenAiFinishReason(choice?.finish_reason),
    contentBlocks: blocks
  }
}

function toOpenAiTool(tool: ToolDefinition): Record<string, unknown> {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }
  }
}

function toOpenAiMessages(message: AgentMessage): Array<Record<string, unknown>> {
  if (message.role === 'user') {
    if (typeof message.content === 'string') {
      return [{ role: 'user', content: message.content }]
    }
    // tool results — emit one `tool` message per result
    return message.content.map((block: ToolResultBlock) => ({
      role: 'tool',
      tool_call_id: block.toolUseId,
      content: block.content
    }))
  }
  // assistant
  const text = message.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map((b) => b.text)
    .join('')
  const toolCalls = message.content
    .filter((b): b is AssistantToolUseBlock => b.type === 'tool_use')
    .map((b) => ({
      id: b.id,
      type: 'function' as const,
      function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) }
    }))
  const out: Record<string, unknown> = { role: 'assistant' }
  out.content = text || null
  if (toolCalls.length > 0) out.tool_calls = toolCalls
  return [out]
}

function fromOpenAiToolCall(call: {
  id?: string
  type?: string
  function?: { name?: string; arguments?: string }
}): AssistantToolUseBlock | null {
  if (!call?.id || !call.function?.name) return null
  let input: Record<string, unknown> = {}
  if (typeof call.function.arguments === 'string' && call.function.arguments.trim().length > 0) {
    try {
      input = JSON.parse(call.function.arguments) as Record<string, unknown>
    } catch {
      input = { _raw: call.function.arguments }
    }
  }
  return { type: 'tool_use', id: call.id, name: call.function.name, input }
}

function mapOpenAiFinishReason(reason: string | undefined): AgentStopReason {
  switch (reason) {
    case 'stop':
      return 'end_turn'
    case 'tool_calls':
    case 'function_call':
      return 'tool_use'
    case 'length':
      return 'max_tokens'
    default:
      return 'other'
  }
}
