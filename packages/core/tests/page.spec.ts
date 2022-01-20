import { describe, expect, test } from 'vitest'
import { mockConsole, renderPage, sleep } from './mock'
import {
  definePage,
  onDetached,
  onLoad,
  onMoved,
  onReady,
  onShow,
  ref,
  reactive,
  computed,
  watchEffect,
  CORE_KEY,
  watch,
} from '../src'
import type { Core } from '../src/instance'

describe('page', () => {
  test('lifetimes', async () => {
    const calledKeys: string[] = []
    const page = await renderPage(
      { template: '<div id="text" bind:tap="tap">data: {{text}}</div>' },
      () => {
        definePage({
          setup() {
            calledKeys.push('onAttach')
            onShow(() => {
              calledKeys.push('onShow')
            })
            onReady(() => {
              calledKeys.push('onReady')
            })
            onMoved(() => {
              calledKeys.push('onMoved')
            })
            onDetached(() => {
              calledKeys.push('onDetached')
            })
            onLoad(() => {
              calledKeys.push('onLoad')
            })
            onReady(() => {
              calledKeys.push('onReady 2')
            })
            onLoad(() => {
              calledKeys.push('onLoad 2')
            })
            return {}
          },
        })
      }
    )
    expect(calledKeys).toEqual(['onAttach', 'onLoad', 'onLoad 2', 'onShow', 'onReady', 'onReady 2'])
    page.triggerLifeTime('moved')
    expect(calledKeys[calledKeys.length - 1]).toEqual('onMoved')
    page.detach()
    expect(calledKeys[calledKeys.length - 1]).toEqual('onDetached')
  })

  test('reactive binding', async () => {
    const page = await renderPage(
      {
        template:
          '<div id="text" bind:tap="tap">count:{{state.count}} countX2:{{state.countX2}} numRef:{{numRef}}</div>',
      },
      () =>
        definePage({
          setup() {
            const state: { count: number; countX2: number } = reactive({
              count: 1,
              countX2: computed(() => state.count * 2),
            })
            const numRef = ref(0)
            const tap = () => {
              numRef.value++
              state.count++
            }
            return { state, numRef, tap }
          },
        })
    )
    await sleep(10)
    expect(page.dom!.innerHTML).toBe('<div>count:1 countX2:2 numRef:0</div>')
    page.querySelector('#text')?.dispatchEvent('tap')
    await sleep(10)
    expect(page.dom!.innerHTML).toBe('<div>count:2 countX2:4 numRef:1</div>')
  })

  test('error binding', async () => {
    const resetConsole = mockConsole()
    await renderPage({ id: 'id', template: '<div></div>' }, () =>
      definePage({
        setup() {
          const sym = Symbol('sym')
          return { sym: sym }
        },
      })
    )
    await sleep(10)
    expect(console.error).toBeCalledWith(
      '[Jweapp]: setup 含有不支持类型 sym:[object Symbol] 类型. | instance: id'
    )
    resetConsole()
  })

  test('watch/watchEffect', async () => {
    let dummy = 0
    let tempCount = 0
    let stopper = () => {}
    const page = await renderPage({ template: '<div></div>' }, () =>
      definePage({
        setup() {
          const count = ref(0)
          const increment = (): void => {
            count.value++
          }
          watch(count, val => {
            tempCount = val
          })
          stopper = watchEffect(() => {
            dummy = count.value
          })
          return {
            count,
            increment,
          }
        },
      })
    )
    sleep(10)
    const core = page.instance[CORE_KEY] as unknown as Core
    expect(dummy).toBe(0)
    expect(tempCount).toBe(0)
    expect(page.data.count).toBe(0)
    expect(core.scope.effects.length).toBe(4)

    page.instance.increment()
    await sleep(10)
    expect(dummy).toBe(1)
    expect(tempCount).toBe(1)
    expect(page.data.count).toBe(1)

    await sleep(10)
    stopper()
    page.instance.increment()
    await sleep(10)
    expect(dummy).toBe(1)
    expect(tempCount).toBe(2)
    expect(page.data.count).toBe(2)
    expect(core.scope.effects.length).toBe(3)
  })
})
