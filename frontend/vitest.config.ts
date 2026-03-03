import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: './src/tests/setup.ts',
      include: ['src/tests/**/*.spec.ts'],
      exclude: ['tests-e2e/**'],
    },
  }),
)
