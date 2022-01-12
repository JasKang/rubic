import { renderPage, sleep } from './mock'
import { definePage, onDetached, onLoad, onMoved, onReady, onShow, ref } from '../src'

describe('page', () => {
  test('page lifetimes', async () => {
    const lifetimeStack: string[] = []
    const page = await renderPage(
      {
        template: '<div id="text" bind:tap="tap">data: {{text}}</div>',
        props: {
          query1: 'query1',
          query2: 'query2',
          query3: 'query3',
        },
      },
      () => {
        definePage({
          props: {
            query1: String,
            query2: String,
            query3: String,
          },
          setup(props, ctx) {
            const text = ref('text')
            const tap = () => {
              text.value = text.value === 'taped' ? 'text' : 'taped'
            }
            lifetimeStack.push('onAttach')
            onShow(() => {
              lifetimeStack.push('onShow')
            })
            onReady(() => {
              lifetimeStack.push('onReady')
            })

            onMoved(() => {
              lifetimeStack.push('onMoved')
            })
            onDetached(() => {
              lifetimeStack.push('onDetached')
            })
            onLoad(() => {
              lifetimeStack.push('onLoad')
            })
            onReady(() => {
              lifetimeStack.push('onReady 2')
            })
            onLoad(() => {
              lifetimeStack.push('onLoad 2')
            })
            return {
              text,
              tap,
            }
          },
        })
      }
    )
    expect(lifetimeStack).toEqual([
      'onAttach',
      'onLoad',
      'onLoad 2',
      'onShow',
      'onReady',
      'onReady 2',
    ])
    page.triggerLifeTime('moved')
    expect(lifetimeStack[lifetimeStack.length - 1]).toEqual('onMoved')
    page.detach()
    expect(lifetimeStack[lifetimeStack.length - 1]).toEqual('onDetached')
  })
})

// await sleep(100)
// expect(page.dom!.innerHTML).toBe('<wx-view>data: text</wx-view>') // 判断组件渲染结果
// page.querySelector('#text')?.dispatchEvent('tap')
// expect(page.dom!.innerHTML).toBe('<wx-view>data: taped</wx-view>') // 判断组件渲染结果
// page.querySelector('#text')?.dispatchEvent('tap')
// await sleep(10)
// expect(page.dom!.innerHTML).toBe('<wx-view>data: text</wx-view>') // 判断组件渲染结果
// 执行其他的一些测试逻辑
