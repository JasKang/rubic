import { describe, expect, test } from 'vitest'
import { mockConsole, renderComponent, sleep } from './mock'
import {
  onDetached,
  onMoved,
  onReady,
  onShow,
  ref,
  reactive,
  computed,
  watchEffect,
  CORE_KEY,
  watch,
  defineComponent,
} from '../src'
import type { Core } from '../src/instance'

describe('component', () => {
  test('lifetimes', async () => {
    const calledKeys: string[] = []
    const comp = await renderComponent(
      { template: '<div id="text" bind:tap="tap">data: {{text}}</div>' },
      () => {
        defineComponent({
          setup() {
            calledKeys.push('onAttach')
            onReady(() => {
              calledKeys.push('onReady')
            })
            onMoved(() => {
              calledKeys.push('onMoved')
            })
            onDetached(() => {
              calledKeys.push('onDetached')
            })
            onReady(() => {
              calledKeys.push('onReady 2')
            })
            return {}
          },
        })
      }
    )
    comp.render()
    expect(calledKeys).toEqual(['onAttach', 'onReady', 'onReady 2'])
    comp.triggerLifeTime('moved')
    expect(calledKeys[calledKeys.length - 1]).toEqual('onMoved')
    comp.detach()
    expect(calledKeys[calledKeys.length - 1]).toEqual('onDetached')
  })

  test('lifetime outside setup', () => {
    const resetConsole = mockConsole()
    onShow(() => {})
    expect(console.error).toBeCalledWith('[Jweapp]: 当前没有实例 无法创建show钩子.')
    resetConsole()
  })

  test('reactive binding', async () => {
    const comp = await renderComponent(
      {
        template:
          '<div id="text" bind:tap="tap">count:{{state.count}} countX2:{{state.countX2}} numRef:{{numRef}}</div>',
      },
      () =>
        defineComponent({
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
    comp.render()
    await sleep(10)
    expect(comp.dom!.innerHTML).toBe('<div>count:1 countX2:2 numRef:0</div>')
    comp.querySelector('#text')?.dispatchEvent('tap')
    await sleep(10)
    expect(comp.dom!.innerHTML).toBe('<div>count:2 countX2:4 numRef:1</div>')
  })

  test('error binding', async () => {
    const resetConsole = mockConsole()
    const comp = await renderComponent({ id: 'id', template: '<div></div>' }, () =>
      defineComponent({
        setup() {
          const sym = Symbol('sym')
          return { sym: sym }
        },
      })
    )
    comp.render()
    await sleep(10)
    expect(console.error).toBeCalledWith(
      '[Jweapp]: setup 含有不支持类型 sym:[object Symbol] 类型. | instance: id'
    )
    resetConsole()
  })

  test('watch/watchEffect', async () => {
    let dummy = 0
    let tempCount = 0
    let stopper: () => void
    const comp = await renderComponent({ template: '<div></div>' }, () =>
      defineComponent({
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
    comp.render()
    sleep(10)
    const core = comp.instance[CORE_KEY] as unknown as Core
    expect(dummy).toBe(0)
    expect(tempCount).toBe(0)
    expect(comp.data.count).toBe(0)
    expect(core.scope.effects.length).toBe(4)

    comp.instance.increment()
    await sleep(10)
    expect(dummy).toBe(1)
    expect(tempCount).toBe(1)
    expect(comp.data.count).toBe(1)

    await sleep(10)
    stopper!()
    comp.instance.increment()
    await sleep(10)
    expect(dummy).toBe(1)
    expect(tempCount).toBe(2)
    expect(comp.data.count).toBe(2)
    expect(core.scope.effects.length).toBe(3)
  })

  test('props', async () => {
    const comp = await renderComponent(
      {
        template: '<div id="text">text:{{text}} value:{{value}}</div>',
        props: {
          title: '标题',
          value: 1,
        },
      },
      () =>
        defineComponent({
          props: {
            title: String,
            desc: {
              type: String,
              value: '无描述',
            },
            value: {
              type: [String, Number],
              value: 10,
            },
          },
          setup(props) {
            const text = computed(() => props.title + props.desc)
            return { text }
          },
        })
    )
    comp.render()
    await sleep(10)
    expect(comp.dom!.innerHTML).toBe('<div>text:标题无描述 value:1</div>')
  })
})
