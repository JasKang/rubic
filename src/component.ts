import type { ComponentInstance, Instance } from './instance'
import type { ComponentObjectPropsOptions, ComponentPropsOptions, ExtractPropTypes } from './props'
import type { ComponentInnerOptions, Flat, RelationOption, AnyObject } from './types'
import { CORE_KEY, COMPONENT_LIFETIMES, COMPONENT_PAGE_LIFETIMES, COMPONENT_METHOD_LIFETIMES } from './constants'
import { convertProps } from './props'
import { keysToRecord } from './utils'
import { setupBehavior } from './setup'
import { wrapLifetimeHooks } from './lifetimes'
import { loadMiddlewares } from './middleware'

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
  /**
   * 兼容性
   */
  [key: string]: any
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
  const { setup, options } = loadMiddlewares(componentOptions, 'Component')

  const {
    properties: propsOptions = {},
    options: innerOptions,
    behaviors = [],
    externalClasses,
    relations,
    methods,
    ...others
  } = options

  const properties = convertProps(propsOptions)
  const propNames = Object.keys(properties)

  const { detached, ...lifetimes } = wrapLifetimeHooks(COMPONENT_LIFETIMES, 'lifetimes', others.lifetimes)
  const pageLifetimes = wrapLifetimeHooks(COMPONENT_PAGE_LIFETIMES, 'pageLifetimes', others.pageLifetimes)
  const methodsLifetimes = wrapLifetimeHooks(COMPONENT_METHOD_LIFETIMES, 'methods', { methods })

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
      ...methods,
      ...methodsLifetimes,
    },
  }
  return Component(sourceOptions)
}
