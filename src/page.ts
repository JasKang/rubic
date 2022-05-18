import type { Instance, PageInstance } from './instance'
import type { ComponentObjectPropsOptions, ComponentPropsOptions, ExtractPropTypes } from './props'
import type { Flat, AnyObject } from './types'
import { convertProps } from './props'
import { wrapLifetimeHooks } from './lifetimes'
import { setupBehavior } from './setup'
import { usePlugin } from './plugin'
import type { StyleIsolation } from './component'
import { COMPONENT_LIFETIMES, COMPONENT_METHOD_LIFETIMES, COMPONENT_PAGE_LIFETIMES, CORE_KEY } from './constants'

export type PageStyleIsolation = StyleIsolation | 'page-isolated' | 'page-apply-shared' | 'page-shared'

export type PageInnerOptions = {
  /**
   * 组件样式隔离
   */
  styleIsolation?: PageStyleIsolation
}

export type PageBaseOptions<P = {}> = {
  behaviors?: string[]
  /**
   * 一些选项
   */
  options?: PageInnerOptions
  setup: (this: void, props: P, ctx: PageInstance) => AnyObject | void
}

export type PageOptionsWithArrayProps<
  PropNames extends string = string,
  P = Readonly<{ [key in PropNames]?: string }>
> = PageBaseOptions<P> & {
  properties?: PropNames[]
}

export function definePage<P extends string>(pageOptions: PageOptionsWithArrayProps<P>): string {
  const { setup, options } = usePlugin(pageOptions, 'Component')

  const { properties: propsOptions = {}, options: innerOptions, behaviors = [] } = options

  const properties = convertProps(propsOptions)

  const { detached, ...lifetimes } = wrapLifetimeHooks(COMPONENT_LIFETIMES, 'lifetimes')
  const pageLifetimes = wrapLifetimeHooks(COMPONENT_PAGE_LIFETIMES, 'pageLifetimes')
  const methodsLifetimes = wrapLifetimeHooks(COMPONENT_METHOD_LIFETIMES, 'methods', {})

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
    // externalClasses,
    // relations,
    // ...others,
    lifetimes: {
      detached(this: Instance) {
        detached.call(this)
        this[CORE_KEY].scope.stop()
      },
      ...lifetimes,
    },
    pageLifetimes,
    methods: {
      // ...methods,
      ...methodsLifetimes,
    },
  }
  if (__TEST__) {
    // @ts-ignore
    sourceOptions.__IS_PAGE__ = true
  }
  return Component(sourceOptions)
}
