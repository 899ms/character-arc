import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('characterArc', {
  platform: process.platform,
  version: '0.1.0',
  loadWorkspace: () => ipcRenderer.invoke('characterarc:load-workspace'),
  saveWorkspace: (payload: unknown) => ipcRenderer.invoke('characterarc:save-workspace', payload),
  pickCoverImage: () => ipcRenderer.invoke('characterarc:pick-cover-image'),
  exportJson: (payload: unknown) => ipcRenderer.invoke('characterarc:export-json', payload),
  exportText: (payload: unknown) => ipcRenderer.invoke('characterarc:export-text', payload),
  importJson: () => ipcRenderer.invoke('characterarc:import-json')
})
