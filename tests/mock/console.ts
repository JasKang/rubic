const defaultKeys = ['log', 'warn', 'error']

export const mockConsole = () => {
  const originalConsole = { ...console }
  defaultKeys.forEach(key => {
    // @ts-ignore
    global.console[key] = jest.fn()
  })
  return () => {
    global.console = originalConsole
  }
}
