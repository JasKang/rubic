import { describe, expect, test } from 'vitest'
import { defineConfig, router } from '../src'

const mockNavigateActionNames = [
  'navigateTo',
  'switchTab',
  'redirectTo',
  'reLaunch',
  'navigateToMiniProgram',
  'openEmbeddedMiniProgram',
]

const wxAction: Record<string, (param: any) => Promise<{ action: string; param: any }>> = {}
mockNavigateActionNames.forEach(action => {
  wxAction[action] = (param: any) => {
    return Promise.resolve({ action, param })
  }
})

// @ts-ignore
global.wx = wxAction
// @ts-ignore
global.wx.canIUse = () => true

const namedMapping: Record<string, any> = {
  home: '/pages/home/index',
  home2: {
    path: '/pages/home/index',
  },
  home3: '/pages/home/index?test=123',
  home4: {
    path: '/pages/home/index',
    query: { test: 234 },
  },
  noPath: {
    query: { test: 123 },
  },
  homeWithQuery: '/pages/home/index?hello=world',
  tabTest: '/pages/tab/test/index',
  subHome: 'sub:/pages/home/index',
  subHome2: {
    app: 'sub2',
    path: '/pages/home/index',
    query: { hello: 'world' },
  },
}

defineConfig({
  pageMiddlewares: [],
  componentMiddlewares: [],
  router: {
    isTab: (path: string) => path.startsWith('/pages/tab/'),
    appMapping: {
      sub: '123456',
      sub2: {
        appId: '123456',
        embed: true,
      },
    },
    getNamedURL: (name: string) => Promise.resolve(namedMapping[name]),
  },
})

describe('router go', () => {
  test('url 1', async () => {
    const { action, param } = await router.go('/pages/home/index')
    expect(action).toEqual('navigateTo')
    expect(param.url).toEqual('/pages/home/index')
  })
  test('url 2', async () => {
    const { action, param } = await router.go({
      url: '/pages/home/index',
      query: { test: 123 },
    })
    expect(action).toEqual('navigateTo')
    expect(param.url).toEqual('/pages/home/index?test=123')
  })

  test('url 3', async () => {
    const { action, param } = await router.go('/pages/home/index?hello=shenzhen', {
      query: { name: 'world' },
    })
    expect(action).toEqual('navigateTo')
    expect(param.url).toEqual('/pages/home/index?hello=shenzhen&name=world')
  })

  test('url 4', async () => {
    const { action, param } = await router.go({
      url: '/pages/home/index?hello=shenzhen',
      query: { hello: 'world' },
    })
    expect(action).toEqual('navigateTo')
    expect(param.url).toEqual('/pages/home/index?hello=world')
  })

  test('url 5', async () => {
    const { action, param } = await router.go({
      url: '/pages/home/index?hello=shenzhen',
      query: { name: 'world' },
    })
    expect(action).toEqual('navigateTo')
    expect(param.url).toEqual('/pages/home/index?hello=shenzhen&name=world')
  })

  test('name 1', async () => {
    const { param } = await router.go('home')
    expect(param.url).toEqual('/pages/home/index')
  })

  test('name 2', async () => {
    const { param } = await router.go({
      name: 'home2',
      query: { test: 123 },
    })
    expect(param.url).toEqual('/pages/home/index?test=123')
  })

  test('name 3', async () => {
    const { param } = await router.go({
      name: 'home3',
    })
    expect(param.url).toEqual('/pages/home/index?test=123')
  })

  test('name 4', async () => {
    const { param } = await router.go({
      name: 'home4',
    })
    expect(param.url).toEqual('/pages/home/index?test=234')
  })

  test('name 5', async () => {
    const { param } = await router.go({
      name: 'home4',
      query: { test: 123 },
    })
    expect(param.url).toEqual('/pages/home/index?test=123')
  })

  test('no path', async () => {
    await expect(() =>
      router.go({
        name: 'noPath',
      })
    ).rejects.toEqual(new Error('path is required'))
  })
  test('name not found', async () => {
    await expect(() =>
      router.go({
        name: 'dummy',
        query: { test: 123, foo: 'bar' },
      })
    ).rejects.toEqual(new Error(`未找到dummy对应的URL`))
  })
})

describe('router go switchTab', () => {
  test('path', async () => {
    const { action, param } = await router.go({
      url: '/pages/tab/test/index',
      query: { test: 123 },
    })
    expect(action).toEqual('switchTab')
    expect(param.url).toEqual('/pages/tab/test/index?test=123')
  })

  test('name', async () => {
    const { action, param } = await router.go({
      name: 'tabTest',
      query: { test: 123 },
    })
    expect(action).toEqual('switchTab')
    expect(param.url).toEqual('/pages/tab/test/index?test=123')
  })
})

describe('router go miniprogram', () => {
  test('path 1', async () => {
    const { action, param } = await router.go('sub:/pages/home/index', {
      query: { test: 123 },
    })
    expect(action).toEqual('navigateToMiniProgram')
    expect(param.appId).toEqual('123456')
    expect(param.path).toEqual('/pages/home/index?test=123')
  })
  test('path 2', async () => {
    const { action, param } = await router.go({
      app: 'sub',
      url: '/pages/home/index',
      query: { test: 123 },
    })
    expect(action).toEqual('navigateToMiniProgram')
    expect(param.appId).toEqual('123456')
    expect(param.path).toEqual('/pages/home/index?test=123')
  })
  test('name', async () => {
    const { action, param } = await router.go({
      name: 'subHome',
      query: { test: 123 },
    })
    expect(action).toEqual('navigateToMiniProgram')
    expect(param.appId).toEqual('123456')
    expect(param.path).toEqual('/pages/home/index?test=123')
  })
  test('name 2', async () => {
    const { action, param } = await router.go({
      name: 'subHome2',
      query: { test: 123 },
    })
    expect(action).toEqual('openEmbeddedMiniProgram')
    expect(param.appId).toEqual('123456')
    expect(param.path).toEqual('/pages/home/index?hello=world&test=123')
  })
})

describe('router other action', () => {
  test('redirectTo', async () => {
    const { action, param } = await router.redirect({
      name: 'home',
      query: { test: 123 },
    })
    expect(action).toEqual('redirectTo')
    expect(param.url).toEqual('/pages/home/index?test=123')
  })

  test('relaunch', async () => {
    const { action, param } = await router.relaunch({
      name: 'home',
      query: { test: 123 },
    })
    expect(action).toEqual('reLaunch')
    expect(param.url).toEqual('/pages/home/index?test=123')
  })
  test('url param', async () => {
    const { action, param } = await router.go({
      url: `/pages/home/index?url=${encodeURIComponent('https://mp.weixin.qq.com/s/1')}`,
      query: { url2: 'https://mp.weixin.qq.com/s/2' },
    })

    expect(param.url).toEqual(
      '/pages/home/index?url=https%3A%2F%2Fmp.weixin.qq.com%2Fs%2F1&url2=https%3A%2F%2Fmp.weixin.qq.com%2Fs%2F2'
    )
  })
})
