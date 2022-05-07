import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

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
    include: ['tests/**/*.{test,spec}.{ts,js}'],
    globals: true,
    environment: 'jsdom',
    watch: false,
    // globalSetup: ['./tests/mock/setup.ts'],
    setupFiles: ['tests/mock/setup.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      reporter: process.env.CI ? 'lcov' : 'text',
    },
  },
})
