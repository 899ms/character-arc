import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'

const APP_MIN_WIDTH = 1360
const APP_MIN_HEIGHT = 860
const WORKSPACE_DB = 'workspace.db'
const WORKSPACE_FILE = 'workspace.json'
const WORKSPACE_KEY = 'active-workspace'

function createMainWindow(): void {
  const window = new BrowserWindow({
    width: 1560,
    height: 960,
    minWidth: APP_MIN_WIDTH,
    minHeight: APP_MIN_HEIGHT,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    // Keep native caption buttons while giving the renderer a compact title-bar area to style around.
    titleBarOverlay:
      process.platform === 'win32'
        ? {
            color: '#f5f5f7',
            symbolColor: '#1d1d1f',
            height: 28
          }
        : false,
    backgroundColor: '#f5f5f7',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  window.once('ready-to-show', () => {
    window.show()
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
    window.webContents.openDevTools({ mode: 'detach' })
  } else {
    void window.loadFile(join(__dirname, '../../dist/index.html'))
  }
}

function getWorkspaceDirPath(): string {
  return join(app.getPath('userData'), 'data')
}

function getWorkspaceFilePath(): string {
  return join(getWorkspaceDirPath(), WORKSPACE_FILE)
}

function getWorkspaceDbPath(): string {
  return join(getWorkspaceDirPath(), WORKSPACE_DB)
}

let workspaceDb: DatabaseSync | null = null

async function ensureWorkspaceDir(): Promise<void> {
  await mkdir(getWorkspaceDirPath(), { recursive: true })
}

async function ensureWorkspaceDb(): Promise<DatabaseSync> {
  if (workspaceDb) {
    return workspaceDb
  }

  await ensureWorkspaceDir()
  workspaceDb = new DatabaseSync(getWorkspaceDbPath())
  workspaceDb.exec(`
    CREATE TABLE IF NOT EXISTS workspace_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) STRICT;
  `)

  await migrateLegacyWorkspaceFile(workspaceDb)
  return workspaceDb
}

async function migrateLegacyWorkspaceFile(db: DatabaseSync): Promise<void> {
  const hasWorkspace = db.prepare('SELECT value FROM workspace_state WHERE key = ?').get(WORKSPACE_KEY) as
    | { value: string }
    | undefined

  if (hasWorkspace) {
    return
  }

  try {
    const legacyRaw = await readFile(getWorkspaceFilePath(), 'utf-8')
    const legacyPayload = JSON.parse(legacyRaw)
    db.prepare(`
      INSERT INTO workspace_state (key, value, updated_at)
      VALUES (?, ?, ?)
    `).run(WORKSPACE_KEY, JSON.stringify(legacyPayload), new Date().toISOString())
  } catch {
    // Ignore missing or invalid legacy files and let the renderer fall back to defaults.
  }
}

function validateImportedWorkspace(payload: unknown): { valid: true } | { valid: false; message: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, message: '导入文件不是有效的项目对象。' }
  }

  const data = payload as Record<string, unknown>
  if (!data.project || typeof data.project !== 'object') {
    return { valid: false, message: '缺少 project 字段，无法识别项目基础信息。' }
  }

  const project = data.project as Record<string, unknown>
  if (typeof project.title !== 'string' || !project.title.trim()) {
    return { valid: false, message: 'project.title 缺失或为空。' }
  }

  const collectionChecks: Array<[string, unknown]> = [
    ['worldviewEntries', data.worldviewEntries],
    ['characters', data.characters],
    ['outlineItems', data.outlineItems],
    ['chapters', data.chapters]
  ]

  for (const [field, value] of collectionChecks) {
    if (value !== undefined && !Array.isArray(value)) {
      return { valid: false, message: `${field} 必须是数组格式。` }
    }
  }

  if (Array.isArray(data.chapters)) {
    const invalidChapter = data.chapters.find((item) => {
      if (!item || typeof item !== 'object') return true
      const chapter = item as Record<string, unknown>
      return typeof chapter.title !== 'string' || typeof chapter.content !== 'string'
    })
    if (invalidChapter) {
      return { valid: false, message: 'chapters 中存在缺少 title 或 content 的章节项。' }
    }
  }

  return { valid: true }
}

ipcMain.handle('characterarc:export-json', async (_event, payload: unknown) => {
  const window = BrowserWindow.getFocusedWindow()
  if (!window) {
    return { success: false, canceled: true }
  }

  const result = await dialog.showSaveDialog(window, {
    title: '导出项目数据',
    defaultPath: 'characterarc-export.json',
    filters: [
      { name: 'JSON 文件', extensions: ['json'] }
    ]
  })

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true }
  }

  await writeFile(result.filePath, JSON.stringify(payload, null, 2), 'utf-8')
  return {
    success: true,
    canceled: false,
    filePath: result.filePath
  }
})

ipcMain.handle('characterarc:export-text', async (_event, payload: unknown) => {
  const window = BrowserWindow.getFocusedWindow()
  if (!window) {
    return { success: false, canceled: true }
  }

  const result = await dialog.showSaveDialog(window, {
    title: '导出章节文本',
    defaultPath: 'characterarc-export.txt',
    filters: [
      { name: '文本文档', extensions: ['txt'] }
    ]
  })

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true }
  }

  const data = payload as {
    project?: { title?: string } | null
    chapters?: Array<{ title?: string; content?: string }>
  }

  const text = [
    data.project?.title ? `# ${data.project.title}` : '# CharacterArc 导出',
    '',
    ...(data.chapters ?? []).flatMap((chapter, index) => [
      `第${index + 1}章 ${chapter.title ?? '未命名章节'}`,
      '',
      chapter.content?.trim() || '（暂无正文内容）',
      '',
      ''.padEnd(48, '-'),
      ''
    ])
  ].join('\n')

  await writeFile(result.filePath, text, 'utf-8')
  return {
    success: true,
    canceled: false,
    filePath: result.filePath
  }
})

ipcMain.handle('characterarc:import-json', async () => {
  const window = BrowserWindow.getFocusedWindow()
  if (!window) {
    return { success: false, canceled: true }
  }

  const result = await dialog.showOpenDialog(window, {
    title: '导入项目 JSON',
    properties: ['openFile'],
    filters: [
      { name: 'JSON 文件', extensions: ['json'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true }
  }

  const raw = await readFile(result.filePaths[0], 'utf-8')
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      success: false,
      canceled: false,
      error: '文件不是有效的 JSON 格式。'
    }
  }

  const validation = validateImportedWorkspace(parsed)
  if (!validation.valid) {
    return {
      success: false,
      canceled: false,
      error: validation.message
    }
  }

  return {
    success: true,
    canceled: false,
    payload: parsed
  }
})

ipcMain.handle('characterarc:load-workspace', async () => {
  try {
    const db = await ensureWorkspaceDb()
    const row = db.prepare('SELECT value FROM workspace_state WHERE key = ?').get(WORKSPACE_KEY) as
      | { value: string }
      | undefined

    if (!row) {
      return {
        success: false,
        payload: null
      }
    }

    return {
      success: true,
      payload: JSON.parse(row.value)
    }
  } catch (error) {
    return {
      success: false,
      payload: null,
      error: error instanceof Error ? error.message : 'Unknown workspace load error'
    }
  }
})

ipcMain.handle('characterarc:save-workspace', async (_event, payload: unknown) => {
  try {
    const db = await ensureWorkspaceDb()
    db.prepare(`
      INSERT INTO workspace_state (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).run(WORKSPACE_KEY, JSON.stringify(payload), new Date().toISOString())

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown workspace save error'
    }
  }
})

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
