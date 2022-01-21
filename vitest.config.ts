/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      rubic: resolve(__dirname, 'packages/rubic/index.ts'),
    },
  },
  define: {
    __TEST__: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    watch: false,
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      include: ['packages/*/src/**/*.ts'],
      reporter: ['text', 'lcov'],
    },
  },
})
