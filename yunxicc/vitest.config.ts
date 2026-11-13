import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000
  },
  resolve: { alias: { '@shared': resolve(__dirname, 'src/shared') } }
})
