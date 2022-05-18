import type { ComponentInstance, Instance } from './instance'
import type { ComponentObjectPropsOptions, ComponentPropsOptions, ExtractPropTypes } from './props'
import type { Flat, AnyObject } from './types'
import { CORE_KEY, COMPONENT_LIFETIMES, COMPONENT_PAGE_LIFETIMES, COMPONENT_METHOD_LIFETIMES } from './constants'
import { convertProps } from './props'
import { keysToRecord } from './utils'
import { setupBehavior } from './setup'
import { wrapLifetimeHooks } from './lifetimes'
import { usePlugin } from './plugin'

export type StyleIsolation = 'isolated' | 'apply-shared' | 'shared'

export type RelationOption = {
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

export type ComponentInnerOptions = {
  /**
   * 启用多slot支持
   */
  multipleSlots?: boolean
  /**
   * 组件样式隔离
   */
  styleIsolation?: StyleIsolation
  /**
   * 虚拟化组件节点
   */
  virtualHost?: boolean
}

export type ComponentBaseOptions<P = {}> = {
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
  options?: ComponentInnerOptions
  setup: (this: void, props: P, ctx: ComponentInstance) => AnyObject | void
}

type ComponentOptionsWithoutProps<P = {}> = ComponentBaseOptions<P> & {
  properties?: undefined
}

type ComponentOptionsWithArrayProps<
  PropNames extends string = string,
  P = Readonly<{ [key in PropNames]?: string }>
> = ComponentBaseOptions<P> & {
  properties: PropNames[]
}

type ComponentOptionsWithObjectProps<
  PropsOptions = ComponentObjectPropsOptions,
  P = Readonly<Flat<ExtractPropTypes<PropsOptions>>>
> = ComponentBaseOptions<P> & {
  properties: PropsOptions
}

export function defineComponent<P = {}>(options: ComponentOptionsWithoutProps<P>): string
export function defineComponent<P extends string>(options: ComponentOptionsWithArrayProps<P>): string
export function defineComponent<P extends Readonly<ComponentPropsOptions>>(
  options: ComponentOptionsWithObjectProps<P>
): string
export function defineComponent(
  componentOptions: ComponentBaseOptions<AnyObject> & {
    properties?: ComponentPropsOptions
  }
) {
  const { setup, options } = usePlugin(componentOptions, 'Component')

  const {
    properties: propsOptions = {},
    options: innerOptions,
    behaviors = [],
    externalClasses,
    relations,
    ...others
  } = options

  const properties = convertProps(propsOptions)
  const propNames = Object.keys(properties)

  const { detached, ...lifetimes } = wrapLifetimeHooks(COMPONENT_LIFETIMES, 'lifetimes')
  const pageLifetimes = wrapLifetimeHooks(COMPONENT_PAGE_LIFETIMES, 'pageLifetimes')
  const methodsLifetimes = wrapLifetimeHooks(COMPONENT_METHOD_LIFETIMES, 'methods', {})

  const observers = keysToRecord(propNames, propName => {
    return function (this: ComponentInstance, value: unknown) {
      const _props = this[CORE_KEY].props
      if (_props[propName] !== value) {
        _props[propName] = value
      }
    }
  })

  const sourceOptions = {
    behaviors: [
      ...behaviors,
      // setup behaviors 在最后执行可以使
      setupBehavior({
        properties,
        setup,
      }),
    ],
    options: Object.assign(
      {
        multipleSlots: true,
      },
      innerOptions
    ),
    externalClasses,
    relations,
    observers,
    ...others,
    lifetimes: {
      detached(this: Instance) {
        detached.call(this)
        this[CORE_KEY].scope.stop()
      },
      ...lifetimes,
    },
    pageLifetimes,
    methods: {
      ...methodsLifetimes,
    },
  }
  return Component(sourceOptions)
}
