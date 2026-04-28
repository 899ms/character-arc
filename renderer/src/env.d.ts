/// <reference types="vite/client" />

declare global {
  interface Window {
    characterArc: {
      platform: string
      version: string
      loadWorkspace: () => Promise<{
        success: boolean
        payload?: unknown
        error?: string
      }>
      saveWorkspace: (payload: unknown) => Promise<{
        success: boolean
        error?: string
      }>
      exportJson: (payload: unknown) => Promise<{
        success: boolean
        canceled: boolean
        filePath?: string
      }>
      exportText: (payload: unknown) => Promise<{
        success: boolean
        canceled: boolean
        filePath?: string
      }>
      importJson: () => Promise<{
        success: boolean
        canceled: boolean
        payload?: unknown
        error?: string
      }>
    }
  }
}

export {}
