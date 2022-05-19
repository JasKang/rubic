import { describe, expect, test } from 'vitest'
import { createApp, ref, computed, watchEffect, nextTick, onAppLaunch, onAppShow } from '../src'
import { launchApp, mockConsole } from './mock'

const launchOptions: WechatMiniprogram.App.LaunchShowOption = {
  path: '/pages/test',
  query: { a: 'a' },
  scene: 1001,
  shareTicket: '',
}

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
          const num = 0
          const count = ref(0)
          const double = computed(() => count.value * 2)
          const increment = (): void => {
            count.value++
          }

          return {
            num,
            count,
            double,
            increment,
          }
        },
      })
    )

    app.onLaunch(launchOptions)
    expect(app.num).toBe(0)
    expect(app.count.value).toBe(0)
    expect(app.double.value).toBe(0)

    let dummy
    watchEffect(() => {
      dummy = app.count.value
    })
    await nextTick()
    expect(dummy).toBe(0)

    app.increment()
    expect(app.count.value).toBe(1)
    expect(app.double.value).toBe(2)

    await nextTick()
    expect(dummy).toBe(1)
  })

  test('lifetimes', async () => {
    const calledKeys: string[] = []
    const app = await launchApp(() =>
      createApp({
        setup() {
          onAppLaunch(options => {
            calledKeys.push(`onLaunch0:${options.path}`)
          })
          onAppLaunch(options => {
            calledKeys.push(`onLaunch1:${options.path}`)
          })
          onAppShow(options => {
            calledKeys.push(`onAppShow0:${options.path}`)
          })
          onAppShow(options => {
            calledKeys.push(`onAppShow1:${options.path}`)
          })
        },
      })
    )
    expect(calledKeys[0]).toBe('onLaunch0:/pages/test')
    expect(calledKeys[1]).toBe('onLaunch1:/pages/test')
    app.onShow(launchOptions)
    expect(calledKeys[2]).toBe('onAppShow0:/pages/test')
    expect(calledKeys[3]).toBe('onAppShow1:/pages/test')
  })
  test('lifetime outside setup', async () => {
    const resetConsole = mockConsole()
    onAppShow(() => {})
    expect(console.error).toHaveBeenLastCalledWith('[core]: 当前没有实例 无法创建 onShow 钩子.')
    resetConsole()
  })
})
