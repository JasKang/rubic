import { readonly } from '@vue/reactivity'
import { setCurrentInstance, createCore, type Instance } from './instance'
import { CORE_KEY } from './constants'
import type { Data } from './types'
import { isFunction } from './utils'
import { error } from './errorHandling'
import { bindingToData } from './bindings'
import { watchBinding, watchRender } from './renderer'

const ctxIgnoreKeys: Array<string | symbol> = [
  // 'animate',
  // 'applyAnimation',
  // 'applyDataUpdates',
  // 'clearAnimation',
  // 'createIntersectionObserver',
  // 'createMediaQueryObserver',
  // 'createSelectorQuery',
  // 'data',
  // 'dataset',
  // 'exitState',
  // 'getOpenerEventChannel',
  // 'getPageId',
  // 'getRelationNodes',
  // 'getTabBar',
  // 'groupSetData',
  // 'hasBehavior',
  // 'id',
  // 'is',
  // 'mergeDataOnPath',
  // 'pageRouter',
  // 'properties',
  // 'replaceDataOnPath',
  // 'router',
  // 'selectAllComponents',
  // 'selectComponent',
  // 'selectOwnerComponent',
  'setData',
  // 'setInitialRenderingCache',
  // 'setUpdatePerformanceListener',
  // 'triggerEvent',
]

export function getContextProxy(ctx: Instance) {
  const proxy = new Proxy(ctx, {
    get(target, key, receiver) {
      if (ctxIgnoreKeys.indexOf(key) >= 0) {
        throw Error(`处于安全考虑 ctx 中禁止调用 ${String(key)} `)
      }
      return Reflect.get(target, key, receiver)
    },
  })
  return proxy
}

type setupBehaviorOptions = {
  properties: Record<string, any>
  setup?: (...args: any[]) => any
  options?: Record<string, any>
}

export const setupBehavior = ({ properties = {}, setup, options = {} }: setupBehaviorOptions) => {
  const propNames = Object.keys(properties)
  return Behavior({
    properties,
    lifetimes: {
      created(this: Instance) {
        this[CORE_KEY] = createCore(this, options)
      },
      attached(this: Instance) {
        const ctx = this
        const core = ctx[CORE_KEY]
        // @ts-ignore
        core.initHooks(ctx.route ? 'Page' : 'Component')

        ctx.nextTick = core.nextTick
        setCurrentInstance(ctx)
        for (const prop of propNames) {
          core.props[prop] = ctx.data[prop]
        }
        const props = readonly(core.props) as Data

        let bindings: Record<string, any> = {}
        core.scope.run(() => {
          bindings = setup ? setup(props, getContextProxy(ctx)) || {} : {}
        })
        core.bindings = bindings

        if (bindings) {
          Object.keys(bindings).forEach((key: string) => {
            const value = bindings[key]
            if (isFunction(value)) {
              // @ts-ignore
              ctx[key] = value
              return
            }
            try {
              ctx.setData({ [key]: bindingToData(value, key) })
            } catch (err) {
              error(err as Error, ctx)
            }
            watchBinding.call(ctx, key, value)
          })
        }
        watchRender.call(ctx)
        setCurrentInstance(null)
      },
      detached(this: Instance) {
        if (this[CORE_KEY].type === 'Page') {
          this[CORE_KEY].scope.stop()
        }
      },
    },
  })
}