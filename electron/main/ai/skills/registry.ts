import type { SkillDefinition, SkillScanEntry } from './types'
import { scanSkillsFromDisk } from './discovery'

const skillMaps = new Map<string, Map<string, SkillDefinition>>()
let initialized = false

function resolveRegistryKey(projectId?: string): string {
  const normalizedProjectId = String(projectId ?? '').trim()
  return normalizedProjectId || '_shared'
}

export async function initRegistry(projectId?: string): Promise<void> {
  const skills = await scanSkillsFromDisk(projectId)
  skillMaps.set(resolveRegistryKey(projectId), new Map(skills.map((s) => [s.id, s])))
  initialized = true
}

export async function refreshRegistry(projectId?: string): Promise<void> {
  const skills = await scanSkillsFromDisk(projectId)
  skillMaps.set(resolveRegistryKey(projectId), new Map(skills.map((s) => [s.id, s])))
  initialized = true
}

export function ensureInitialized(): boolean {
  return initialized
}

export function getAllSkills(projectId?: string): SkillDefinition[] {
  return Array.from(skillMaps.get(resolveRegistryKey(projectId))?.values() ?? [])
}

export function getSkillById(id: string, projectId?: string): SkillDefinition | undefined {
  return skillMaps.get(resolveRegistryKey(projectId))?.get(id)
}

export function getEnabledSkills(projectId?: string): SkillDefinition[] {
  return getAllSkills(projectId).filter((s) => s.enabled)
}

export function toScanEntries(projectId?: string): SkillScanEntry[] {
  return getAllSkills(projectId).map((s) => ({
    id: s.id,
    name: s.name,
    version: s.version,
    path: s.path,
    scope: s.scope,
    description: s.description,
    category: s.manifest.category,
    compatibility: s.compatibility,
    compatibilityNote: s.compatibilityNote,
    source: s.source,
    referencesCount: s.referencesCount,
    enabled: s.enabled,
    stageIds: s.manifest.stages
  }))
}

export function toContextEntries(projectId?: string): Array<{ id: string; name: string; description: string; content: string }> {
  return getAllSkills(projectId).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    content: s.content
  }))
}
