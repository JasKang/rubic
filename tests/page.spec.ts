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
} from '../src'

describe('page', () => {
  beforeAll(() => {
    mockConsole()
  })
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
  test('base binding', async () => {
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
    await renderPage(
      {
        id: 'id',
        template: '<div></div>',
      },
      () =>
        definePage({
          setup() {
            const sym = Symbol('sym')
            return { sym: sym }
          },
        })
    )
    sleep(10)
    expect(console.error).toBeCalledWith(
      '[Jweapp]: setup 含有不支持类型 sym:[object Symbol] 类型. | instance: id'
    )
  })
})
