import { EffectScope, readonly } from '@vue/reactivity'
import { CORE_KEY, COMPONENT_LIFETIMES, PAGE_LIFETIMES, PAGE_ON_METHODS } from './constants'
import type { ComponentInstance, Instance } from './instance'
import { createCore, setCurrentInstance } from './instance'
import type { ComponentPropsOptions, PropsRaw } from './props'
import { convertToProperties } from './props'
import type { Expand, Func } from './types'
import { arrayToRecord, bindingToRaw, isFunction } from './util'
import { watchBinding, watchRender } from './bindings'

export type ComponentOptions<
  PropsOptions = ComponentPropsOptions,
  Props = PropsRaw<PropsOptions>
> = {
  props: PropsOptions
  setup: (props: Props, ctx: any) => Record<string, any> | void
  behaviors?: []
  externalClasses?: string[]
  relations?: {}
  options?: WechatMiniprogram.Component.ComponentOptions
}

function wrapHooks<T extends readonly string[]>(
  scope: 'lifetimes' | 'pageLifetimes' | 'methods',
  funcKeys: T
): { [key in T[number]]: Func } {
  const lifeTimes = arrayToRecord<T, Func>(funcKeys, funcKey => {
    return function (this: ComponentInstance, ...args: unknown[]) {
      const core = this[CORE_KEY]
      const hooks = (core.hooks[scope] as any)[funcKey] || []
      let ret: unknown = undefined
      hooks.forEach((func: Func) => {
        ret = func(...args)
      })
      return ret
    }
  })
  return lifeTimes
}

function defineBaseOptions<PropsOptions>(
  componentOptions: ComponentOptions<PropsOptions>,
  isPage = false
) {
  const {
    props: propsOptions = {},
    setup,
    options,
    behaviors,
    externalClasses,
    relations,
  } = componentOptions
  const propsKeys = Object.keys(propsOptions)

  const { detached: onDetached, ...lifetimes } = wrapHooks('lifetimes', COMPONENT_LIFETIMES)

  const detached = function (this: ComponentInstance) {
    onDetached.call(this)
    this[CORE_KEY].scope?.stop()
  }

  const attached = function (this: ComponentInstance) {
    const self = this
    const core = self[CORE_KEY]
    setCurrentInstance(self)

    // core.render.keys = reactive([])
    core.render.patchData = core.render.patchData.bind(self)
    core.scope = new EffectScope()

    for (const prop of propsKeys) {
      core.props[prop] = self.data[prop]
    }
    const props = readonly(core.props) as PropsRaw<PropsOptions>

    const bindings = setup(props, self) || {}
    core.bindings = bindings
    setCurrentInstance(null)

    if (bindings) {
      Object.keys(bindings).forEach((key: string) => {
        const value = bindings[key]
        if (isFunction(value)) {
          self[key] = value
          return
        }
        self.setData({ [key]: bindingToRaw(value) })

        watchBinding.call(self, key, value)
      })
    }
    watchRender.call(self)
  }

  const observers: Record<string, any> = {}
  if (!isPage) {
    for (const key of propsKeys) {
      observers[key] = function (this: ComponentInstance, value: any) {
        const _props = this[CORE_KEY].props
        if (_props[key] !== value) {
          _props[key] = value
        }
      }
    }
  }
  const properties = convertToProperties(propsOptions)

  return {
    behaviors,
    externalClasses,
    relations,
    observers,
    properties: properties,
    data: {},
    options: Object.assign(
      {
        multipleSlots: true,
      },
      options
    ),
    lifetimes: {
      created(this: Instance) {
        this[CORE_KEY] = createCore(isPage)
      },
      attached,
      detached,
      ...lifetimes,
    },
    pageLifetimes: wrapHooks('pageLifetimes', PAGE_LIFETIMES),
    methods: {
      ...(isPage ? wrapHooks('methods', PAGE_ON_METHODS) : {}),
      // onLoad(query) {},
      // onReady() {},
      // onUnload() {},
      // onPullDownRefresh() {},
      // onReachBottom() {},
      // onShareAppMessage(options): ICustomShareContent {},
      // onShareTimeline(): ICustomTimelineContent {},
      // onPageScroll(options) {},
      // onTabItemTap(options) {},
      // onResize(options) {},
      // onAddToFavorites(options): IAddToFavoritesContent {},
    },
  }
}

export function defineComponent<PropsOptions extends ComponentPropsOptions>(
  options: Expand<ComponentOptions<PropsOptions>>
) {
  const originOptions = defineBaseOptions(options)
  return Component(originOptions)
}

export function definePage<PropsOptions extends ComponentPropsOptions>(
  options: Expand<ComponentOptions<PropsOptions>>
) {
  const originOptions = defineBaseOptions(options, true)
  return Component(originOptions)
}

// defineComponent({
//   props: {
//     a: String,
//     b: {
//       type: Number,
//     },
//     c: {
//       type: [String, Number],
//       value: 'asd',
//     },
//   },
//   setup(props) {
//     props.c
//   },
// })
