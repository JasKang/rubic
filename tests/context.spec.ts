import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createApp, getAppContext, onLaunch } from '../src'
import { launchApp, mockConsole, resetConsole } from './mock'

beforeAll(() => {
  mockConsole()
})
afterAll(() => {
  resetConsole()
})

const storage = {
  setItem() {
    return 'setItem'
  },
  getItem() {
    return 'getItem'
  },
}
describe('context', () => {
  test('props', async () => {
    const app = await launchApp(() =>
      createApp({
        setup() {
          const options = {
            scene: '',
            wtag: '',
            channel: 123123,
            deviceID: 'deviceID_value',
          }
          onLaunch(opt => {
            options.scene = opt.scene
          })
          return {
            context: {
              options,
            },
            storage,
          }
        },
      })
    )
    const { options } = getAppContext()
    expect(options.scene).toBe(1001)
    expect(options.wtag).toBe('')
    expect(app.storage.getItem()).toBe('getItem')
    expect(app.storage.setItem()).toBe('setItem')
  })
})
