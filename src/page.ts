import type { Instance, PageInstance } from './instance'
import type { AnyObject, Flat } from './types'
import {
  convertProps,
  type ComponentObjectPropsOptions,
  type ComponentPropsOptions,
  type ExtractPropTypes,
} from './props'
import { wrapLifetimeHooks } from './lifetimes'
import { createSetupHook } from './setup'
import { loadPlugin } from './plugin'
import type { StyleIsolation } from './component'
import { PAGE_LIFETIMES, CORE_KEY } from './constants'

export type PageStyleIsolation =
  | StyleIsolation
  | 'page-isolated'
  | 'page-apply-shared'
  | 'page-shared'

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
  setup?: (props: P, ctx: PageInstance) => AnyObject | void
}

type PageOptionsWithoutProps<P = {}> = PageBaseOptions<P> & {
  properties?: undefined
}

type PageOptionsWithArrayProps<
  PropNames extends string = string,
  P = Readonly<{ [key in PropNames]?: string }>
> = PageBaseOptions<P> & {
  properties: PropNames[]
}

type PageOptionsWithObjectProps<
  PropsOptions = ComponentObjectPropsOptions,
  P = Readonly<Flat<ExtractPropTypes<PropsOptions>>>
> = PageBaseOptions<P> & {
  properties: PropsOptions
}

export function definePage<P = {}>(options: PageOptionsWithoutProps<P>): string
export function definePage<P extends string>(options: PageOptionsWithArrayProps<P>): string
export function definePage<P extends Readonly<ComponentPropsOptions>>(
  options: PageOptionsWithObjectProps<P>
): string
export function definePage(
  pageOptions: PageBaseOptions<any> & {
    properties?: ComponentPropsOptions
  }
) {
  const { setup, options } = loadPlugin(pageOptions, 'Page')
  const {
    behaviors = [],
    properties: propsOptions = {},
    options: innerOptions,
    ...others
  } = options

  const properties = convertProps(propsOptions)

  const { onUnload, ...lifetimes } = wrapLifetimeHooks(PAGE_LIFETIMES)

  const { created, attached } = createSetupHook({ type: 'Page', properties, setup })
  const sourceOptions = {
    behaviors: [
      Behavior({
        properties,
        lifetimes: { created },
      }),
      ...behaviors,
      // setup behaviors 在最后执行可以使
      Behavior({
        lifetimes: { attached },
      }),
    ],
    options: innerOptions,
    ...others,
    ...lifetimes,
    onUnload(this: Instance) {
      onUnload.call(this)
      this[CORE_KEY].isUnmounted = true
      this[CORE_KEY].scope.stop()
    },
  }
  return Page(sourceOptions) as unknown as string
}
