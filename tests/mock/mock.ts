import jComponent from 'j-component'

type RenderOptions = {
  id?: string
  template: string
  path?: string
  usingComponents?: Record<string, string>
  props?: Record<string, any>
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
  const root = jComponent.create(options.id, options.props)
  const parent = document.createElement(`${options.id}-wrapper`)
  try {
    root.attach(parent)
  } catch (error) {
    console.log('renderPage error')
  }

  root.instance.onLoad(options.props)
  await sleep(10)
  // @ts-ignore
  root.triggerPageLifeTime('show')
  await sleep(10)
  root.instance.onReady()
  return root
}

export function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
