/**
 * Provider-neutral tool-use protocol shared by Anthropic Messages API
 * (tool_use blocks) and OpenAI-compatible Chat Completions (tool_calls).
 *
 * Transports translate to/from these shapes; the agent loop only deals
 * with these types.
 */

export type ToolInputSchema = {
  type: 'object'
  properties: Record<string, unknown>
  required?: string[]
}

export type ToolDefinition = {
  name: string
  description: string
  inputSchema: ToolInputSchema
}

export type AssistantTextBlock = { type: 'text'; text: string }

export type AssistantToolUseBlock = {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export type AssistantReasoningBlock = { type: 'reasoning'; reasoning: string }

export type AssistantContentBlock = AssistantTextBlock | AssistantToolUseBlock | AssistantReasoningBlock

export type ToolResultBlock = {
  type: 'tool_result'
  toolUseId: string
  content: string
  isError?: boolean
}

export type AgentMessage =
  | { role: 'user'; content: string | ToolResultBlock[] }
  | { role: 'assistant'; content: AssistantContentBlock[] }

export type AgentStopReason = 'end_turn' | 'tool_use' | 'max_tokens' | 'other'

export type AgentResponse = {
  stopReason: AgentStopReason
  contentBlocks: AssistantContentBlock[]
}

export type AgentRequestParams = {
  system: string
  messages: AgentMessage[]
  tools: ToolDefinition[]
  maxTokens?: number
}

export type ToolContext = {
  signal: AbortSignal
  projectId: string
}

export type ToolHandlerResult = {
  content: string
  isError?: boolean
}

export type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolContext
) => Promise<ToolHandlerResult>

export type Tool = {
  definition: ToolDefinition
  handler: ToolHandler
}

export function isToolUseBlock(block: AssistantContentBlock): block is AssistantToolUseBlock {
  return block.type === 'tool_use'
}

export function isTextBlock(block: AssistantContentBlock): block is AssistantTextBlock {
  return block.type === 'text'
}
