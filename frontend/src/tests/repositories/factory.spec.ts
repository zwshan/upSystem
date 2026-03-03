import { describe, expect, it } from 'vitest'

import { createRepositories } from '@/repositories/factory'

describe('repository factory', () => {
  it('returns mock repos when mode is mock', () => {
    const repos = createRepositories('mock')
    expect(repos.kind).toBe('mock')
  })
})
