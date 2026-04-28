import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('characterArc', {
  platform: process.platform,
  version: '0.1.0'
})
