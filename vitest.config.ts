/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      rubic: resolve(__dirname, './src/index.ts'),
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
      include: ['src/**/*.ts'],
      reporter: process.env.CI ? 'lcov' : 'text',
    },
  },
})
