import { describe, expect, test, vi } from 'vitest'
import type { Core } from '../src'
import {
  onTabItemTap,
  onAddToFavorites,
  onShareTimeline,
  onShareAppMessage,
  onPageScroll,
  onReachBottom,
  onResize,
  onPullDownRefresh,
  onUnload,
  onHide,
  nextTick,
  readonly,
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
import { mockConsole, renderPage, sleep } from './mock'

describe('page', async () => {
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
      `[core]: 错误的数据类型 sym:[object Symbol], 小程序 data 仅支持可以转成 JSON 的类型(string | number | boolean | object | array) | instance: id`
    )
    resetConsole()
  })

  test('readonly binding', async () => {
    const page = await renderPage(() =>
      definePage({
        setup() {
          const state = readonly({ count: 0 })
          return { state }
        },
      })
    )

    expect(page.data.state).toEqual({ count: 0 })
  })

  test('array binding', async () => {
    const page = await renderPage(() =>
      definePage({
        setup() {
          const count = ref(0)
          const double = computed(() => count.value * 2)
          const increment = (): void => {
            count.value++
          }

          return {
            arr: [count, double],
            increment,
          }
        },
      })
    )

    expect(page.data.arr).toEqual([0, 0])
    page.instance.increment()
    await nextTick()
    expect(page.data.arr).toEqual([1, 2])
  })

  test('object binding', async () => {
    const page = await renderPage(() =>
      definePage({
        setup() {
          const count = ref(0)
          const double = computed(() => count.value * 2)
          const increment = (): void => {
            count.value++
          }

          return {
            obj: { count, double },
            increment,
          }
        },
      })
    )

    expect(page.data.obj).toEqual({ count: 0, double: 0 })

    page.instance.increment()
    await nextTick()
    expect(page.data.obj).toEqual({ count: 1, double: 2 })
  })

  test('unbundling', async () => {
    const page = await renderPage(() =>
      definePage({
        setup() {
          const count = ref(0)
          const double = computed(() => count.value * 2)
          const increment = (): void => {
            count.value++
          }

          return {
            count,
            double,
            increment,
          }
        },
      })
    )

    expect(page.instance[CORE_KEY].scope.effects.length).toBe(4)

    page.instance.increment()
    page.instance.onUnload()
    await nextTick()
    expect(page.data.count).toBe(1)
    expect(page.data.double).toBe(2)
  })

  test('watch', async () => {
    let dummy: number
    let stopper: () => void
    const page = await renderPage(() =>
      definePage({
        setup() {
          const count = ref(0)
          const increment = (): void => {
            count.value++
          }

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
    expect(page.instance[CORE_KEY].scope.effects.length).toBe(3)

    await nextTick()
    expect(dummy!).toBe(0)
    expect(page.data.count).toBe(0)
    // The other is `count` sync watcher

    page.instance.increment()
    await nextTick()
    expect(dummy!).toBe(1)
    expect(page.data.count).toBe(1)

    stopper!()
    page.instance.increment()
    await nextTick()
    expect(dummy!).toBe(1)
    expect(page.data.count).toBe(2)
    expect(page.instance[CORE_KEY].scope.effects.length).toBe(2)
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

  test('lifetimes', async () => {
    const resetConsole = mockConsole()
    const calledKeys: string[] = []
    const page = await renderPage({ template: '<div id="text" bind:tap="tap">data: {{text}}</div>' }, () => {
      definePage({
        setup() {
          calledKeys.push('onAttach')
          onShow(() => {
            calledKeys.push('onShow')
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
          onLoad(() => {
            calledKeys.push('onLoad 2')
          })
          return {}
        },
      })
    })
    expect(calledKeys).toEqual(['onAttach', 'onLoad', 'onLoad 2', 'onShow'])
    // expect(console.error).toBeCalledWith(`[core]: Page 不存在 moved 钩子.`)
    // expect(console.error).toBeCalledWith(`[core]: Page 不存在 detached 钩子.`)
    resetConsole()
  })

  test('lifecycle outside', async () => {
    const resetConsole = mockConsole()
    onShow(() => {})

    expect(console.error).toHaveBeenLastCalledWith('[core]: 当前没有实例 无法创建 onShow 钩子.')
    resetConsole()
  })
  test('onLoad', async () => {
    const params = { query: 1 }
    const onLoadFn = vi.fn()
    const setup = vi.fn((query, context) => {
      onLoad(onLoadFn)
      expect(context.is).toBe('')
      expect(context.getOpenerEventChannel).toBeInstanceOf(Function)
    })
    const page = await renderPage({ props: params }, () =>
      definePage({
        setup,
      })
    )

    expect(onLoadFn).toBeCalledWith(params)
    expect(setup).toBeCalledTimes(1)
  })

  test('onReady', async () => {
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    const page = await renderPage(() =>
      definePage({
        setup() {
          onReady(() => {
            injectedFn1()
          })
          onReady(injectedFn2)
        },
      })
    )
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  test('onShow', async () => {
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    const page = await renderPage(() =>
      definePage({
        setup() {
          onShow(injectedFn1)
          onShow(injectedFn2)
        },
      })
    )
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  test('onHide', async () => {
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    const page = await renderPage(() =>
      definePage({
        properties: ['query1'],
        setup(query) {
          onHide(injectedFn1)
          onHide(injectedFn2)
        },
      })
    )

    page.triggerPageLifeTime('hide')
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  test('onUnload', async () => {
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    const page = await renderPage(() =>
      definePage({
        setup() {
          onUnload(injectedFn1)
          onUnload(injectedFn2)
        },
      })
    )

    page.instance.onUnload()
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  test('onPullDownRefresh', async () => {
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    const page = await renderPage(() =>
      definePage({
        setup() {
          onPullDownRefresh(injectedFn1)
          onPullDownRefresh(injectedFn2)
        },
      })
    )

    page.instance.onPullDownRefresh()
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  test('onReachBottom', async () => {
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    const page = await renderPage(() =>
      definePage({
        setup() {
          onReachBottom(injectedFn1)
          onReachBottom(injectedFn2)
        },
      })
    )

    page.instance.onReachBottom()
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  test('onResize', async () => {
    const arg = {}
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()

    const page = await renderPage(() =>
      definePage({
        setup() {
          onResize(injectedFn1)
          onResize(injectedFn2)
        },
      })
    )

    page.triggerPageLifeTime('resize', arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  test('onTabItemTap', async () => {
    const arg = {}
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    const page = await renderPage(() =>
      definePage({
        setup() {
          onTabItemTap(injectedFn1)
          onTabItemTap(injectedFn2)
        },
      })
    )

    page.instance.onTabItemTap(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  test('onPageScroll', async () => {
    const arg = {}
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    const page = await renderPage(() =>
      definePage({
        setup() {
          onPageScroll(injectedFn1)
          onPageScroll(injectedFn2)
        },
      })
    )

    page.instance.onPageScroll(arg)

    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  test('onShareAppMessage', async () => {
    const arg = {}
    const fn = vi.fn(() => ({ title: 'test' }))
    const page = await renderPage(() =>
      definePage({
        setup() {
          onShareAppMessage(() => ({}))
          onShareAppMessage(fn)
        },
      })
    )

    const shareContent = page.instance.onShareAppMessage(arg)
    expect(fn).toBeCalledTimes(1)
    expect(shareContent).toEqual({ title: 'test' })
  })

  test('onShareTimeline', async () => {
    let title = 0
    const fn = vi.fn(() => ({ title: `${title++}` }))
    const page = await renderPage(() =>
      definePage({
        setup() {
          onShareTimeline(fn)
          onShareTimeline(fn)
        },
      })
    )

    const shareContent = page.instance.onShareTimeline()
    expect(fn).toBeCalledTimes(2)
    expect(shareContent).toEqual({ title: '1' })
  })

  test('onAddToFavorites', async () => {
    const arg = {}
    const fn = vi.fn(() => ({ title: 'test' }))
    const page = await renderPage(() =>
      definePage({
        setup() {
          onAddToFavorites(fn)
        },
      })
    )

    const favoritesContent = page.instance.onAddToFavorites(arg)
    expect(fn).toBeCalledWith(arg)
    expect(favoritesContent).toEqual({ title: 'test' })
  })

  test('properties', async () => {
    const resetConsole = mockConsole()
    let query: Record<string, any> = {}
    const page = await renderPage(
      {
        props: {
          a: 'aaa',
          b: '123',
        },
        path: '/test/test/page',
      },
      () =>
        definePage({
          properties: ['a', 'b'],
          setup(props) {
            query = props
          },
        })
    )
    expect(query.a).toBe('aaa')
    expect(query.b).toBe('123')
    expect(query.c).toBe(undefined)
    query.c = 'c'
    resetConsole()
  })

  test('queryProps', async () => {
    const resetConsole = mockConsole()
    let query: Record<string, any> = {}
    const page = await renderPage(
      {
        props: {
          a: 'aaa',
          b: '123',
        },
        path: '/test/test/page',
      },
      () =>
        definePage({
          properties: ['a', 'b'],
          setup(props) {
            // @ts-ignore
            query = props
          },
        })
    )
    expect(query.a).toBe('aaa')
    expect(query.b).toBe('123')
    expect(query.c).toBe(undefined)
    resetConsole()
  })
})
