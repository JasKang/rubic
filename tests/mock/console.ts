import { vi } from 'vitest'

const defaultKeys = ['log', 'warn', 'error'] as const
const originalConsole = { ...console }

export const mockConsole = () => {
  defaultKeys.forEach(key => {
    global.console[key] = vi.fn()
  })
  return () => {
    global.console = originalConsole
  }
}

export const resetConsole = () => {
  global.console = originalConsole
}
