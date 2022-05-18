import type { ComponentBaseOptions } from './component'
import type { AnyObject } from './types'
import { warn } from './errorHandling'
import type { Instance } from './instance'
import type { PageBaseOptions } from './page'

export type PluginOptions = (options: ComponentBaseOptions) => ComponentBaseOptions

export type PluginSetup = (props: Record<string, any>, ctx: Instance, next?: () => void | AnyObject) => void | AnyObject

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

export function compose(setupGroup: PluginSetup[], instance: any) {
  return function (props: Record<string, any>, ctx: any, next: PluginSetup): AnyObject {
    let index = -1

    function dispatch(i: number): AnyObject {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }
      if (i === setupGroup.length) {
        return next.call(instance, props, ctx)
      }

      index = i
      const setup = setupGroup[i]
      if (!setup) return {} as AnyObject

      if (setup.length > 2) {
        return setup.call(instance, props, ctx, function next() {
          return dispatch(i + 1)
        })
      } else {
        const bindings = setup.call(instance, props, ctx)
        return { ...bindings, ...dispatch(i + 1) }
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
  originOptions: T,
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
    // @ts-ignore
    const setup = compose(setupGroup, this)
    return setup(props, ctx, originSetup)
  }

  return {
    options: originOptions,
    setup,
  }
}
