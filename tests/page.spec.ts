import path from 'path'
import simulate from 'miniprogram-simulate'

describe('page', () => {
  let id: string

  beforeAll(() => {
    id = simulate.load(path.resolve(__dirname, 'page/index'), { less: true })
  })

  test('page data sync', async () => {
    const comp = simulate.render(id, {
      query1: 'query1',
      query2: 'query2',
      query3: 'query3',
    })
    comp.attach(document.body)
    expect(comp.dom!.innerHTML).toBe('<wx-view>data: text</wx-view>') // 判断组件渲染结果
    comp.querySelector('#text')?.dispatchEvent('tap')
    await simulate.sleep(10)
    expect(comp.dom!.innerHTML).toBe('<wx-view>data: taped</wx-view>') // 判断组件渲染结果
    comp.querySelector('#text')?.dispatchEvent('tap')
    await simulate.sleep(10)
    expect(comp.dom!.innerHTML).toBe('<wx-view>data: text</wx-view>') // 判断组件渲染结果
    // 执行其他的一些测试逻辑
    comp.detach()
  })
})
