import { readonly } from '@vue/reactivity'
import { CORE_KEY, COMPONENT_LIFETIMES, PAGE_LIFETIMES, PAGE_ON_METHODS } from './constants'
import type { ComponentInstance, Instance, PageInstance } from './instance'
import { createCore, setCurrentInstance } from './instance'
import type { ComponentPropsOptions, PropsRaw } from './props'
import { convertToProperties } from './props'
import type { Expand } from './types'
import { bindingToRaw, isFunction } from './util'
import { watchBinding, watchRender } from './bindings'
import { wrapHooks } from './lifetimes'

export type Setup<Props, IsPage> = (
  props: Props,
  ctx: IsPage extends false ? ComponentInstance : PageInstance
) => Record<string, any> | void

export type ComponentOptions<
  PropsOptions = ComponentPropsOptions,
  IsPage extends boolean = false,
  Props = PropsRaw<PropsOptions>
> = {
  props: PropsOptions
  setup: Setup<Props, IsPage>
  behaviors?: []
  externalClasses?: string[]
  relations?: {}
  options?: WechatMiniprogram.Component.ComponentOptions
}

function defineBaseOptions<PropsOptions, IsPage extends boolean = false>(
  componentOptions: ComponentOptions<PropsOptions, IsPage>,
  isPage: IsPage
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

  const detached = function (this: Instance) {
    onDetached.call(this)
    this[CORE_KEY].scope.stop()
  }

  const attached = function (this: Instance) {
    const ctx = this
    const core = this[CORE_KEY]
    setCurrentInstance(this)
    for (const prop of propsKeys) {
      core.props[prop] = this.data[prop]
    }
    const props = readonly(core.props) as PropsRaw<PropsOptions>
    ctx.$nextRender = core.nextRender
    const bindings = setup(props, ctx as any) || {}
    core.bindings = bindings
    if (bindings) {
      Object.keys(bindings).forEach((key: string) => {
        const value = bindings[key]
        if (isFunction(value)) {
          // @ts-expect-error: bindings 函数
          this[key] = value
          return
        }
        this.setData({ [key]: bindingToRaw(value) })
        watchBinding.call(this, key, value)
      })
    }
    watchRender.call(this)
    setCurrentInstance(null)
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
        this[CORE_KEY] = createCore(this, isPage)
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
  const originOptions = defineBaseOptions(options, false)
  return Component(originOptions)
}

export function definePage<PropsOptions extends ComponentPropsOptions>(
  options: Expand<ComponentOptions<PropsOptions, true>>
) {
  const originOptions = defineBaseOptions(options, true)
  return Component(originOptions)
}

// definePage({
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
//   setup(props, ctx) {
//     // ctx.
//     props.c
//   },
// })

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
//   setup(props, ctx) {
//     // ctx.asdf
//     props.c
//   },
// })
