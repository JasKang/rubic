import { renderPage, sleep } from './mock'
import { definePage, onDetached, onLoad, onMoved, onReady, onShow, ref } from '../src'

describe('page', () => {
  test('page lifetimes', async () => {
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
  test('raw binding', async () => {
    const page = await renderPage(
      { template: '<div id="text" bind:tap="tap">num:{{num}},numRef:{{numRef}}</div>' },
      () =>
        definePage({
          setup() {
            const num = 0
            const numRef = ref(0)
            const tap = () => {
              numRef.value++
            }
            return { num, numRef, tap }
          },
        })
    )
    await sleep(10)
    expect(page.dom!.innerHTML).toBe('<div>num:0,numRef:0</div>') // 判断组件渲染结果
    page.querySelector('#text')?.dispatchEvent('tap')
    await sleep(10)
    expect(page.dom!.innerHTML).toBe('<div>num:0,numRef:1</div>') // 判断组件渲染结果
  })
})
