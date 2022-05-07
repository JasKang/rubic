import type { PageInstance } from './instance'
import type { ComponentObjectPropsOptions, ComponentPropsOptions, ExtractPropTypes } from './props'
import type { Flat, AnyObject, PageInnerOptions } from './types'
import { PAGE_LIFETIMES } from './constants'
import { convertProps } from './props'
import { wrapLifetimeHooks } from './lifetimes'
import { setupBehavior } from './setup'
import { loadMiddlewares } from './middleware'

type PageSetupOptions = {
  enablePageScroll?: boolean
  enableShareAppMessage?: boolean
  enableShareTimeline?: boolean
}

export function pageLifetimesFilter<T extends Record<string, any>>(
  lifetimes: T,
  setupOptions: Required<PageSetupOptions>
): T {
  if (!setupOptions.enablePageScroll) {
    delete lifetimes['onPageScroll']
  }
  if (!setupOptions.enableShareAppMessage) {
    delete lifetimes['onShareAppMessage']
  }
  if (!setupOptions.enableShareTimeline) {
    delete lifetimes['onShareTimeline']
  }
  return lifetimes as T
}

export type PageBaseOptions<P = {}> = {
  // queryProps 兼容 properties
  properties?: Record<string, any>
  behaviors?: string[]
  /**
   * 一些选项
   */
  options?: PageInnerOptions
  data?: Record<string, any>
  setupOptions?: PageSetupOptions
  setup: (this: void, props: P, ctx: PageInstance) => AnyObject | void
} & { [key: string]: any } // 兼容

export type PageOptionsWithoutProps<P = {}> = Flat<
  PageBaseOptions<P> & {
    queryProps?: undefined
  }
>
export type PageOptionsWithArrayProps<
  PropNames extends string = string,
  P = Readonly<{ [key in PropNames]?: string }>
> = PageBaseOptions<P> & {
  queryProps: PropNames[]
}
export type PageOptionsWithObjectProps<
  PropsOptions = ComponentObjectPropsOptions,
  P = Readonly<Flat<ExtractPropTypes<PropsOptions>>>
> = PageBaseOptions<P> & {
  queryProps: PropsOptions
}

export function definePage<P = {}>(options: PageOptionsWithoutProps<P>): void
export function definePage<P extends string>(options: PageOptionsWithArrayProps<P>): void
export function definePage<P extends Readonly<ComponentPropsOptions>>(options: PageOptionsWithObjectProps<P>): void
export function definePage(
  pageOptions: PageBaseOptions<AnyObject> & {
    queryProps?: ComponentPropsOptions
  }
) {
  const { setup, options } = loadMiddlewares(pageOptions, 'Page')

  const {
    properties: propertiesOptions = {},
    queryProps: propsOptions = {},
    options: innerOptions,
    setupOptions: userSetupOptions = {},
    behaviors = [],
    ...others
  } = options

  const properties = convertProps(Object.assign({}, propertiesOptions, propsOptions))

  const setupOptions = Object.assign(
    { enableShareAppMessage: false, enableShareTimeline: false, enablePageScroll: false },
    userSetupOptions
  )

  const lifetimes = pageLifetimesFilter(wrapLifetimeHooks(PAGE_LIFETIMES, null, others), setupOptions)

  const sourceOptions = {
    behaviors: [
      ...behaviors,
      // setup behaviors 在最后执行可以使
      setupBehavior({
        properties,
        setup,
        options: setupOptions,
      }),
    ],
    options: innerOptions,
    ...others,
    ...lifetimes,
  }
  return Page(sourceOptions)
}
