import { readonly } from '@vue/reactivity'
import { CORE_KEY, COMPONENT_LIFETIMES, PAGE_LIFETIMES, PAGE_ON_METHODS } from './constants'
import type { ComponentInstance, Instance, PageInstance } from './instance'
import { createCore, setCurrentInstance } from './instance'
import type { ComponentObjectPropsOptions, ComponentPropsOptions, ExtractPropTypes } from './props'
import { convertToProperties } from './props'
import type { Data, FlatType } from './types'
import { bindingToData, isFunction } from './util'
import { watchBinding, watchRender } from './bindings'
import { wrapHooks } from './lifetimes'
import { error } from './errorHandling'

type StyleIsolation = 'isolated' | 'apply-shared' | 'shared'
type PageStyleIsolation =
  | 'isolated'
  | 'apply-shared'
  | 'shared'
  | 'page-isolated'
  | 'page-apply-shared'
  | 'page-shared'

interface ComponentInnerOptions<I = false> {
  /**
   * 启用多slot支持
   */
  multipleSlots?: boolean
  /**
   * 组件样式隔离
   */
  styleIsolation?: I extends true ? PageStyleIsolation : StyleIsolation
  /**
   * 虚拟化组件节点
   */
  virtualHost?: boolean
}

export interface RelationOption {
  /** 目标组件的相对关系 */
  type: 'parent' | 'child' | 'ancestor' | 'descendant'
  /** 关系生命周期函数，当关系被建立在页面节点树中时触发，触发时机在组件attached生命周期之后 */
  linked?(target: any): void
  /** 关系生命周期函数，当关系在页面节点树中发生改变时触发，触发时机在组件moved生命周期之后 */
  linkChanged?(target: any): void
  /** 关系生命周期函数，当关系脱离页面节点树时触发，触发时机在组件detached生命周期之后 */
  unlinked?(target: any): void
  /** 如果这一项被设置，则它表示关联的目标节点所应具有的behavior，所有拥有这一behavior的组件节点都会被关联 */
  target?: string | undefined
}

type ComponentOptionsBase<P, I = false> = {
  behaviors?: string[]
  /**
   * 组件接受的外部样式类
   */
  externalClasses?: string[]
  /**
   * 组件间关系定义
   */
  relations?: {
    [key: string]: RelationOption
  }
  /**
   * 一些选项
   */
  options?: ComponentInnerOptions<I>
  setup: (
    this: void,
    props: P,
    ctx: I extends true ? FlatType<PageInstance> : FlatType<ComponentInstance>
  ) => AnyObject | void
}

type ComponentOptionsWithoutProps<P = {}, I = false> = ComponentOptionsBase<P, I> & {
  props?: undefined
}

type ComponentOptionsWithArrayProps<
  PropNames extends string = string,
  I = false,
  P = Readonly<{ [key in PropNames]?: string }>
> = ComponentOptionsBase<P, I> & {
  props: PropNames[]
}

type ComponentOptionsWithObjectProps<
  PropsOptions = ComponentObjectPropsOptions,
  I = false,
  P = Readonly<FlatType<ExtractPropTypes<PropsOptions>>>
> = ComponentOptionsBase<P, I> & {
  props: PropsOptions
}

function defineBaseComponent<P = {}, I = false>(
  options: ComponentOptionsWithoutProps<P, I>,
  isPage: I
): string
function defineBaseComponent<P extends string, I = false>(
  options: ComponentOptionsWithArrayProps<P, I>,
  isPage: I
): string
function defineBaseComponent<P extends Readonly<ComponentPropsOptions>, I = false>(
  options: ComponentOptionsWithObjectProps<P, I>,
  isPage: I
): string
function defineBaseComponent(
  componentOptions: ComponentOptionsBase<AnyObject> & {
    props?: ComponentPropsOptions
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
    ctx.nextTick = core.nextTick
    for (const prop of propsKeys) {
      core.props[prop] = this.data[prop]
    }
    const props = readonly(core.props) as Data
    const bindings = setup(props, ctx) || {}
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
          this.setData({ [key]: bindingToData(value, key) })
        } catch (err) {
          error(err as Error, this)
        }
        watchBinding.call(this, key, value)
      })
    }
    watchRender.call(this)
    setCurrentInstance(null)
  }

  const observers: AnyObject = {}
  if (!isPage) {
    for (const key of propsKeys) {
      observers[key] = function (this: ComponentInstance, value: unknown) {
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

export function defineComponent<Props = {}>(
  options: ComponentOptionsWithoutProps<Props, false>
): string
export function defineComponent<PropNames extends string>(
  options: ComponentOptionsWithArrayProps<PropNames, false>
): string
export function defineComponent<PropsOptions extends Readonly<ComponentPropsOptions>>(
  options: ComponentOptionsWithObjectProps<PropsOptions, false>
): string
export function defineComponent(options: any) {
  return defineBaseComponent(options, false)
}

export function definePage<Props = {}>(options: ComponentOptionsWithoutProps<Props, true>): string
export function definePage<PropNames extends string>(
  options: ComponentOptionsWithArrayProps<PropNames, true>
): string
export function definePage<PropsOptions extends Readonly<ComponentPropsOptions>>(
  options: ComponentOptionsWithObjectProps<PropsOptions, true>
): string
export function definePage(options: any) {
  return defineBaseComponent(options, true)
}

// definePage({
//   setup(props, ctx) {
//     // ctx.
//     // ctx.
//   },
// })
// definePage({
//   props: ['title', 'desc'],
//   setup(props, ctx) {
//     // ctx.
//     // ctx.
//   },
// })

// defineComponent({
//   props: {
//     a: null,
//     b: {
//       type: Number,
//     },
//     c: {
//       type: [String, Number],
//       value: 'asd',
//     },
//   },
//   setup(props, ctx) {
//     props.b
//     props.a
//     props.c
//     // ctx.asdf
//     props.c
//   },
// })
