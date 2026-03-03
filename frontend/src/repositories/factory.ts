import type { Repositories } from '@/repositories/contracts'
import { createApiRepositories } from '@/repositories/api'
import { createMockRepositories } from '@/repositories/mock'

export type DataMode = 'mock' | 'api'

let cachedRepositories: Repositories | null = null

export function createRepositories(mode: DataMode = (import.meta.env.VITE_DATA_MODE as DataMode) ?? 'mock'): Repositories {
  if (mode === 'api') {
    return createApiRepositories()
  }

  return createMockRepositories()
}

export function getRepositories(): Repositories {
  if (!cachedRepositories) {
    cachedRepositories = createRepositories()
  }

  return cachedRepositories
}
