import type { ComponentBaseOptions } from './component'
import type { Bindings } from './types'
import { warn } from './errorHandling'
import type { Instance } from './instance'
import type { PageBaseOptions } from './page'

export type PluginOptions = (options: ComponentBaseOptions) => void

type PluginSetupA = (props: Record<string, any>, ctx: Instance) => void | Bindings
type PluginSetupB = (props: Record<string, any>, ctx: Instance, next: () => void | Bindings) => void | Bindings
export type PluginSetup = PluginSetupB | PluginSetupA

export type Plugin = {
  name: string
  type?: 'Page' | 'Component'
  options?: PluginOptions
  setup?: PluginSetup
}

/**
 * 插件存储
 */
const globalPlugins = new Set<Plugin>()

function isSerialSetup(setup: PluginSetup): setup is PluginSetupA {
  return setup.length <= 2
}
export function compose(setupGroup: PluginSetup[], props: Record<string, any>, ctx: any) {
  return function (next: PluginSetupA): void | AnyObject {
    let index = -1

    function dispatch(i: number): void | AnyObject {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }
      if (i === setupGroup.length) {
        return next(props, ctx)
      }

      index = i
      const setup = setupGroup[i]
      if (!setup) return undefined

      if (isSerialSetup(setup)) {
        const bindings = setup(props, ctx)
        return { ...bindings, ...dispatch(i + 1) }
      } else {
        let prev: void | Bindings = {}
        const curr = setup(props, ctx, () => {
          prev = dispatch(i + 1)
          return prev
        })
        return curr || prev
      }
    }

    return dispatch(0)
  }
}

export function registerPlugins(plugins: Plugin[]) {
  for (const plugin of plugins) {
    if (globalPlugins.has(plugin)) {
      warn(`中间件 ${plugin.name} 重复注册`)
    } else {
      globalPlugins.add(plugin)
    }
  }
}

export function usePlugin<T extends ComponentBaseOptions | PageBaseOptions>(
  originOptions: T & { properties: any },
  type: 'Page' | 'Component'
) {
  const { setup: originSetup } = originOptions

  const setupGroup: PluginSetup[] = []

  const installedPlugins = [...globalPlugins].filter(plugin => (plugin.type ? plugin.type === type : true))

  for (const plugin of installedPlugins) {
    const { type: _type, options, setup } = plugin || {}
    const pluginType = _type ? [_type] : ['Page', 'Component']

    if (pluginType.indexOf(type) !== -1) {
      if (options) {
        options(originOptions as any)
      }
      if (setup) {
        setupGroup.push(setup)
      }
    }
  }

  function setup(props: any, ctx: any) {
    const setup = compose(setupGroup, props, ctx)
    return setup(originSetup as PluginSetupA)
  }

  return {
    options: originOptions as T,
    setup,
  }
}
