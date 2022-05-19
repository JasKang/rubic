import type { RootComponent } from 'j-component'
import jComponent from 'j-component'
import type { Core, CORE_KEY } from '../../src'
import { isFunction } from '../../src/utils'
import { sleep } from './utils'

type RenderOptions = {
  id?: string
  template?: string
  path?: string
  usingComponents?: Record<string, string>
  props?: Record<string, any>
}

type MockRootComponent = RootComponent<
  Record<string, any>,
  Record<string, WechatMiniprogram.Component.AllProperty>,
  Record<string, any>
> & {
  [CORE_KEY]: Core
  triggerPageLifeTime: (name: string, ...args: any[]) => any
}

declare global {
  function setCurrentRender(options: RenderOptions): void
}

export async function launchApp(create: () => void) {
  const app = create() as unknown as WechatMiniprogram.App.Instance<Record<string, any>>
  app.onLaunch({
    path: '/pages/test',
    query: {
      query1: 'query1',
    },
    scene: 1001,
    shareTicket: 'ticket',
  })
  return app
}

/**
 * 获取随机 id
 */
let seed = +new Date()
const charString = 'abcdefghij'
function getId() {
  const id = ++seed
  return id
    .toString()
    .split('')
    .map(item => charString[+item])
    .join('')
}

export async function renderPage(define: () => void): Promise<MockRootComponent>
export async function renderPage(options: RenderOptions, define: () => void): Promise<MockRootComponent>
export async function renderPage(
  _defineOrOptions: RenderOptions | (() => void),
  _define?: () => void
): Promise<MockRootComponent> {
  const options = { id: getId(), template: '<div></div>', props: {} }
  let define = _define!
  if (isFunction(_defineOrOptions)) {
    define = _defineOrOptions
  } else {
    Object.assign(options, _defineOrOptions)
  }
  setCurrentRender(options)
  define()
  const root = jComponent.create(options.id, options.props) as MockRootComponent
  const parent = document.createElement(`${options.id}-wrapper`)
  root.attach(parent)
  root.instance.onLoad(options.props)

  // await sleep(0)
  // @ts-ignore
  root.triggerPageLifeTime('show')
  // await sleep(0)
  // root.triggerLifeTime('ready')
  return root
}
export type MockComponent = RootComponent<
  {
    [x: string]: any
  },
  { [x: string]: any },
  {
    [x: string]: Function
  }
>
export async function renderComponent(define: () => void): Promise<MockComponent>
export async function renderComponent(options: RenderOptions, define: () => void): Promise<MockComponent>
export async function renderComponent(_options: any, _define?: () => void): Promise<MockComponent> {
  const define = typeof _define === 'function' ? _define : _options
  const options = Object.assign({ id: getId() }, typeof _options === 'object' ? _options : {})
  setCurrentRender(options)
  define()
  const root: MockComponent = jComponent.create(options.id, options.props)
  root.attach(document.createElement(`${options.id}-wrapper`))
  // root.instance.page
  await sleep(10)
  return Promise.resolve(root)
}
