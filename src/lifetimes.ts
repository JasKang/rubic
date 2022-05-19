import type { HookType } from './constants'
import {
  COMPONENT_METHOD_LIFETIMES,
  APP_LIFETIMES,
  CORE_KEY,
  COMPONENT_LIFETIMES,
  COMPONENT_PAGE_LIFETIMES,
} from './constants'
import type { Core, Instance, InstanceType } from './instance'
import { getCurrentInstance } from './instance'
import { error } from './errorHandling'
import type { Func } from './types'
import { firstToLower, keysToRecord } from './utils'

type AllHook = HookType[keyof HookType]

function isAppLt(key: string): key is HookType['App'] {
  return APP_LIFETIMES.indexOf(key as typeof APP_LIFETIMES[number]) >= 0
}

function isComponentLt(key: string): key is HookType['Component'] {
  return COMPONENT_LIFETIMES.indexOf(key as typeof COMPONENT_LIFETIMES[number]) >= 0
}
function isComponentPageLt(key: string): key is HookType['ComponentPage'] {
  return COMPONENT_PAGE_LIFETIMES.indexOf(key as typeof COMPONENT_PAGE_LIFETIMES[number]) >= 0
}
function isComponentMethodsLt(key: string): key is HookType['ComponentMethods'] {
  return COMPONENT_METHOD_LIFETIMES.indexOf(key as typeof COMPONENT_METHOD_LIFETIMES[number]) >= 0
}

export function wrapLifetimeHooks<T extends readonly string[]>(
  keys: T,
  scope: 'lifetimes' | 'pageLifetimes' | 'methods' | null,
  originLifetimes: Record<string, any> = {}
): { [key in T[number]]: Func } {
  const lifeTimes = keysToRecord<T, Func>(keys, key => {
    return function (this: any, ...args: unknown[]) {
      const core = this[CORE_KEY] as Core

      // @ts-ignore
      const lifeTimes: Func[] = (scope ? core.hooks[scope]?.[key] : core.hooks[key]) || []

      let orgLt = null
      if (scope) {
        orgLt = originLifetimes[scope]?.[key] || null
      } else {
        orgLt = originLifetimes[key] || null
      }
      if (orgLt) {
        lifeTimes.push(orgLt)
      }

      let ret: unknown = undefined
      lifeTimes.forEach(func => {
        ret = func(...args)
      })
      return ret
    }
  })
  return lifeTimes
}

function getLifetimeHooks(lifetime: AllHook, scopes: InstanceType[], ins: Instance) {
  const { type, hooks } = ins[CORE_KEY]
  let key: AllHook = lifetime
  if (scopes.indexOf(type) === -1) {
    return `${type} 不存在 ${key} 钩子.`
  }
  if (type === 'App') {
    return isAppLt(key) ? hooks[key] : `App 不存在 ${key} 钩子.`
  } else {
    const tempKey = firstToLower(key.substring(2)) as AllHook
    if (isComponentLt(tempKey) || isComponentPageLt(tempKey)) {
      key = tempKey
    }
    if (isComponentLt(key)) {
      // @ts-ignore
      return hooks.lifetimes[key]
    } else if (isComponentPageLt(key)) {
      // @ts-ignore
      return hooks.pageLifetimes[key]
    } else if (isComponentMethodsLt(key)) {
      // @ts-ignore
      return hooks.methods[key]
    }
    return `${type} 不存在 ${lifetime} 钩子.`
  }
}

function createHook<T extends Func>(
  lifetime: AllHook,
  scopes: InstanceType[],
  options: {
    validator?: (ins: Instance, lifetime: string) => void | string
    // before?: (func: T) => ReturnType<T>
    // after?: (func: T) => ReturnType<T>
  } = {}
) {
  // TODO: 拓展钩子
  const { validator } = options
  // console.log(before, after);

  return (hook: T) => {
    const ins = getCurrentInstance()
    if (!ins) {
      return error(new Error(`当前没有实例 无法创建 ${lifetime} 钩子.`))
    }

    const err = validator ? validator(ins, lifetime) : false
    if (err) {
      return error(new Error(err))
    }

    const hooksOrError = getLifetimeHooks(lifetime, scopes, ins)
    if (Array.isArray(hooksOrError)) {
      hooksOrError.push(hook)
    } else {
      error(new Error(hooksOrError))
    }
  }
}

/**
 * ====== App Lifetime ====
 */
type IAppLt = Required<WechatMiniprogram.App.Option>
export const onAppLaunch = createHook<IAppLt['onLaunch']>('onLaunch', ['App'])
export const onAppShow = createHook<IAppLt['onShow']>('onShow', ['App'])
export const onAppHide = createHook<IAppLt['onHide']>('onHide', ['App'])
export const onAppPageNotFound = createHook<IAppLt['onPageNotFound']>('onPageNotFound', ['App'])
export const onAppUnhandledRejection = createHook<IAppLt['onUnhandledRejection']>('onUnhandledRejection', ['App'])
export const onAppThemeChange = createHook<IAppLt['onThemeChange']>('onThemeChange', ['App'])
export const onAppError = createHook<IAppLt['onError']>('onError', ['App'])

/**
 * ====== Component Lifetime  ====
 */
type CLt = Required<WechatMiniprogram.Component.Lifetimes['lifetimes']>
// created、attached 没有
export const onReady = createHook<CLt['ready']>('onReady', ['Page', 'Component'])
export const onMoved = createHook<CLt['moved']>('onMoved' as 'moved', ['Page', 'Component'])
export const onDetached = createHook<CLt['detached']>('onDetached' as 'detached', ['Page', 'Component'])
export const onError = createHook<CLt['error']>('onError', ['Page', 'Component'])

/**
 * ====== Component PageLifetime  ====
 */
type CPageLt = Required<WechatMiniprogram.Component.PageLifetimes>
export const onShow = createHook<CPageLt['show']>('onShow', ['Page', 'Component'])
export const onHide = createHook<CPageLt['hide']>('onHide', ['Page', 'Component'])
export const onResize = createHook<CPageLt['resize']>('onResize' as 'resize', ['Page', 'Component'])

/**
 * ====== Component Methods  ====
 */
type IPageLt = Required<WechatMiniprogram.Page.ILifetime>
export const onLoad = createHook<IPageLt['onLoad']>('onLoad', ['Page'])
export const onUnload = createHook<IPageLt['onUnload']>('onUnload', ['Page'])
export const onPullDownRefresh = createHook<IPageLt['onPullDownRefresh']>('onPullDownRefresh', ['Page'])
export const onReachBottom = createHook<IPageLt['onReachBottom']>('onReachBottom', ['Page'])
export const onAddToFavorites = createHook<IPageLt['onAddToFavorites']>('onAddToFavorites', ['Page'])
export const onTabItemTap = createHook<IPageLt['onTabItemTap']>('onTabItemTap', ['Page'])
export const onSaveExitState = createHook<() => { data: any; expireTimeStamp: number }>('onSaveExitState', ['Page'])
export const onShareAppMessage = createHook<IPageLt['onShareAppMessage']>('onShareAppMessage', ['Page'])
export const onShareTimeline = createHook<IPageLt['onShareTimeline']>('onShareTimeline', ['Page'])
export const onPageScroll = createHook<IPageLt['onPageScroll']>('onPageScroll', ['Page'])
