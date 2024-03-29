import { reactive, shallowReactive, shallowReadonly } from '@vue/reactivity'
import { createCore, type Instance, setCurrentInstance, unsetCurrentInstance } from './instance'
import { CORE_KEY } from './constants'
import type { Data } from './types'
import { isFunction } from './utils'
import { error, ErrorCodes, warn } from './errorHandling'
import { toDataRaw, watchData } from './bindings'

type CoreSetupOptions = {
  type: 'Page' | 'Component'
  properties: Record<string, any>
  setup?: (...args: any[]) => any
}

function getQueryProxy(params: string[], data: Record<string, any>) {
  const queryData = params.reduce((prev, param) => {
    prev[param] = data[param]
    return prev
  }, {} as any)
  const query = new Proxy(queryData, {
    get(target, prop, receiver) {
      if (!Reflect.has(target, prop)) {
        warn(`参数 ${prop.toString()} 未在 \`properties\` 中定义`)
      }
      return Reflect.get(target, prop, receiver)
    },
  })
  return query
}

export const createSetupHook = ({ type, setup, properties = {} }: CoreSetupOptions) => {
  return {
    created: function (this: Instance) {
      this[CORE_KEY] = createCore(type).initHooks()
    },
    attached: function (this: Instance) {
      const ctx = this as Instance
      const core = ctx[CORE_KEY]

      ctx.$nextTick = fn => {
        ctx[CORE_KEY].renderCbs.push(fn)
      }
      if (core.type === 'Page') {
        core.props = getQueryProxy(Object.keys(ctx.properties), ctx.data)
      } else {
        core.props = Object.keys(properties).reduce((prev, key) => {
          prev[key] = ctx.data[key]
          return prev
        }, shallowReactive<Record<string, any>>({}))
      }

      const props = core.type === 'Page' ? core.props : (shallowReadonly(core.props) as Data)

      setCurrentInstance(ctx)
      const bindings: Record<string, any> = setup ? setup.call(ctx, props, ctx) || {} : {}
      core.bindings = bindings

      if (bindings) {
        const bindingData: any = reactive({})
        for (const key of Object.keys(bindings)) {
          const value = bindings[key]
          if (isFunction(value)) {
            // @ts-ignore
            ctx[key] = value
          } else {
            bindingData[key] = value
          }
        }
        ctx.setData(toDataRaw(bindingData, 'data'))
        watchData(bindingData, ctx, () => {
          try {
            const ticks = [...ctx[CORE_KEY].renderCbs]
            ctx[CORE_KEY].renderCbs = []
            ticks.forEach(fn => fn())
          } catch (err) {
            error(err, ctx, ErrorCodes.NEXT_TICK_FUNCTION)
          }
        })
      }
      unsetCurrentInstance()
    },
  }
}
