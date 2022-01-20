import { readonly } from '@vue/reactivity'
import { CORE_KEY, COMPONENT_LIFETIMES, PAGE_LIFETIMES, PAGE_ON_METHODS } from './constants'
import type { ComponentInstance, Instance, PageInstance } from './instance'
import { createCore, setCurrentInstance } from './instance'
import type { ComponentObjectPropsOptions, ComponentPropsOptions, ExtractPropTypes } from './props'
import { convertToProperties } from './props'
import type { Expand, LooseRequired, UnionToIntersection } from './types'
import { bindingToRaw, isFunction } from './util'
import { watchBinding, watchRender } from './bindings'
import { wrapHooks } from './lifetimes'
import { error } from './errorHandling'

export type Setup<Props, IsPage> = (
  props: Props,
  ctx: IsPage extends false ? Expand<ComponentInstance> : Expand<PageInstance>
) => Record<string, any> | void

type ComponentOptionsBase<P, IsPage = false> = {
  behaviors?: []
  externalClasses?: string[]
  relations?: {}
  options?: Expand<WechatMiniprogram.Component.ComponentOptions>
  setup: (
    props: P,
    ctx: IsPage extends true ? Expand<PageInstance> : Expand<ComponentInstance>
  ) => Record<string, any> | void
}

type ComponentOptionsWithArrayProps<
  PropNames extends string = string,
  IsPage = false,
  Props = Readonly<{ [key in PropNames]?: any }>
> = ComponentOptionsBase<Props, IsPage> & {
  props: PropNames[]
}

type ComponentOptionsWithObjectProps<
  PropsOptions = ComponentObjectPropsOptions,
  IsPage = false,
  Props = Readonly<Expand<ExtractPropTypes<PropsOptions>>>
> = ComponentOptionsBase<Props, IsPage> & {
  props: PropsOptions
}

function defineBaseComponent<PropNames extends string, IsPage = false>(
  options: ComponentOptionsWithArrayProps<PropNames, IsPage>,
  isPage: IsPage
): string
function defineBaseComponent<PropsOptions extends Readonly<ComponentPropsOptions>, IsPage = false>(
  options: ComponentOptionsWithObjectProps<PropsOptions, IsPage>,
  isPage: IsPage
): string
function defineBaseComponent(
  componentOptions: ComponentOptionsBase<Record<string, any>> & {
    props: ComponentPropsOptions
  },
  isPage: boolean
) {
  const {
    props: propsOptions = {},
    setup,
    options,
    behaviors,
    externalClasses,
    relations,
  } = componentOptions
  const properties = convertToProperties(propsOptions)
  const propsKeys = Object.keys(properties)

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
    const props = readonly(core.props) as any
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
        try {
          this.setData({ [key]: bindingToRaw(value, key) })
        } catch (err) {
          error(err as Error, this)
        }
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

  const sourceOptions = {
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
    },
  }
  return Component(sourceOptions)
}

export function defineComponent<PropNames extends string>(
  options: ComponentOptionsWithArrayProps<PropNames, false>
): string
export function defineComponent<PropsOptions extends Readonly<ComponentPropsOptions>>(
  options: ComponentOptionsWithObjectProps<PropsOptions, false>
): string
export function defineComponent(options: any) {
  return defineBaseComponent(options, false)
}

export function definePage<PropNames extends string>(
  options: ComponentOptionsWithArrayProps<PropNames, true>
): string
export function definePage<PropsOptions extends Readonly<ComponentPropsOptions>>(
  options: ComponentOptionsWithObjectProps<PropsOptions, true>
): string
export function definePage(options: any) {
  return defineBaseComponent(options, true)
}

definePage({
  props: ['title', 'desc'],
  setup(props, ctx) {
    // ctx.
    // ctx.
  },
})

defineComponent({
  props: {
    a: null,
    b: {
      type: Number,
    },
    c: {
      type: [String, Number],
      value: 'asd',
    },
  },
  setup(props, ctx) {
    props.b
    props.a
    props.c
    // ctx.asdf
    props.c
  },
})
