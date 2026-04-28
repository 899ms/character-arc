/// <reference types="vite/client" />

declare global {
  interface Window {
    characterArc: {
      platform: string
      version: string
    }
  }
}

export {}
