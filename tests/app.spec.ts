import { launchApp, mockConsole } from './mock'
import { createApp, onAppShow } from '../src'

describe('app', () => {
  test('create', async () => {
    const app = await launchApp(() =>
      createApp({
        setup() {},
      })
    )
    expect(app).toBeDefined()
  })
  test('bindings', async () => {
    const app = await launchApp(() =>
      createApp({
        setup() {
          return { data: 'data' }
        },
      })
    )
    expect(app.data).toBe('data')
  })
  test('lifetimes', async () => {
    const calledKeys: string[] = []
    const app = await launchApp(() =>
      createApp({
        setup() {
          onAppShow(arg => {
            calledKeys.push(`onAppShow:${arg}`)
          })
        },
      })
    )
    // @ts-ignore
    app.onShow('arg1')
    expect(calledKeys[calledKeys.length - 1]).toBe('onAppShow:arg1')
  })
  test('lifetime outside setup', async () => {
    const resetConsole = mockConsole()
    onAppShow(() => {})
    expect(console.error).toBeCalledWith(
      '[Jweapp]: `[Jweapp]: onAppShow 函数必须在 createApp -> setup 期间同步使用.'
    )
    resetConsole()
  })
})
