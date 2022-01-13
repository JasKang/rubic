import type { RootComponent } from 'j-component'
import jComponent from 'j-component'
import { sleep } from './utils'

type RenderOptions = {
  id?: string
  template: string
  path?: string
  usingComponents?: Record<string, string>
  props?: Record<string, any>
}

type MockRootComponent = RootComponent<
  Record<string, any>,
  Record<string, WechatMiniprogram.Component.AllProperty>,
  Record<string, any>
>

// @ts-ignore
global.App = (options: any) => {
  return options
}

export async function launchApp(create: () => void) {
  const app = create() as unknown as WechatMiniprogram.App.Instance<Record<string, any>>
  app.onLaunch({
    path: '/pages/home',
    query: {
      query1: 'query1',
    },
    scene: 1001,
    shareTicket: 'ticket',
  })
  return app
}
let tempLoad: RenderOptions | null = null
/**
 * 自定义组件构造器
 */
// @ts-ignore
global.Component = (options: any) => {
  const component = tempLoad!
  const definition = Object.assign(
    {
      id: component.id,
      path: component.path,
      template: component.template,
      usingComponents: component.usingComponents,
    },
    options
  )
  jComponent.register(definition)
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

export async function renderPage(options: RenderOptions, define: () => void) {
  options.id = options.id || getId()
  tempLoad = options
  define()
  const root: MockRootComponent = jComponent.create(options.id, options.props)
  const parent = document.createElement(`${options.id}-wrapper`)
  root.attach(parent)
  root.instance.onLoad(options.props)
  await sleep(10)
  // @ts-ignore
  root.triggerPageLifeTime('show')
  await sleep(10)
  root.instance.onReady()
  return root
}

export async function renderComponent(options: RenderOptions, define: () => void) {
  options.id = options.id || getId()
  tempLoad = options
  define()
  const root = jComponent.create(options.id, options.props)
  // @ts-ignore
  root.render = () => {
    root.attach(document.createElement(`${options.id}-wrapper`))
  }
  return root as MockRootComponent & {
    render: () => void
  }
}
