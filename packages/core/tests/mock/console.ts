import { vi } from 'vitest'

const defaultKeys = ['log', 'warn', 'error'] as const

export const mockConsole = () => {
  const originalConsole = { ...console }
  defaultKeys.forEach(key => {
    global.console[key] = vi.fn()
  })
  return () => {
    global.console = originalConsole
  }
}
