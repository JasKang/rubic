import type { HookType } from './constants'
import {
  COMPONENT_METHOD_LIFETIMES,
  APP_LIFETIMES,
  CORE_KEY,
  COMPONENT_LIFETIMES,
  COMPONENT_PAGE_LIFETIMES,
  PAGE_LIFETIMES,
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
function isPageLt(key: string): key is HookType['Page'] {
  return PAGE_LIFETIMES.indexOf(key as typeof PAGE_LIFETIMES[number]) >= 0
}
function isComponentLt(key: string): key is HookType['Component'] {
  return COMPONENT_LIFETIMES.indexOf(key as typeof COMPONENT_LIFETIMES[number]) >= 0
}
function isComponentPageLt(key: string): key is HookType['ComponentPage'] {
  return COMPONENT_PAGE_LIFETIMES.indexOf(key as typeof COMPONENT_PAGE_LIFETIMES[number]) >= 0
}
function isComponentMethodLt(key: string): key is HookType['ComponentMethod'] {
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
  let key: AllHook = lifetime

  if (scopes.indexOf(ins[CORE_KEY].type) === -1) {
    return `${ins[CORE_KEY].type} 不存在 ${key} 钩子.`
  }
  const type = ins[CORE_KEY].type
  if (type === 'App') {
    return isAppLt(key) ? ins[CORE_KEY].hooks[key] : `App 不存在 ${key} 钩子.`
  } else if (type === 'Page') {
    return isPageLt(key) ? ins[CORE_KEY].hooks[key] : `Page 不存在 ${key} 钩子.`
  } else {
    const tempKey = firstToLower(key.substring(2)) as AllHook
    if (isComponentLt(tempKey) || isComponentPageLt(tempKey)) {
      key = tempKey
    }
    if (isComponentLt(key)) {
      // @ts-ignore
      return ins[CORE_KEY].hooks.lifetimes[key]
    } else if (isComponentPageLt(key)) {
      // @ts-ignore
      return ins[CORE_KEY].hooks.pageLifetimes[key]
    } else if (isComponentMethodLt(key)) {
      // @ts-ignore
      return ins[CORE_KEY].hooks.methods[key]
    }
    return `Component 不存在 ${key} 钩子.`
  }
}

function createHook<T extends Func>(
  lifetime: AllHook,
  scope: InstanceType | InstanceType[],
  options: {
    validator?: (ins: Instance, lifetime: string) => void | string
    // before?: (func: T) => ReturnType<T>
    // after?: (func: T) => ReturnType<T>
  } = {}
) {
  const scopes = Array.isArray(scope) ? scope : [scope]
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
export const onLaunch = createHook<IAppLt['onLaunch']>('onLaunch', 'App')
export const onAppShow = createHook<IAppLt['onShow']>('onShow', 'App')
export const onAppHide = createHook<IAppLt['onHide']>('onHide', 'App')
export const onPageNotFound = createHook<IAppLt['onPageNotFound']>('onPageNotFound', 'App')
export const onUnhandledRejection = createHook<IAppLt['onUnhandledRejection']>('onUnhandledRejection', 'App')
export const onThemeChange = createHook<IAppLt['onThemeChange']>('onThemeChange', 'App')
export const onError = createHook<IAppLt['onError']>('onError', ['App', 'Component'])

/**
 * ====== Page Lifetime ====
 */
type IPageLt = Required<WechatMiniprogram.Page.ILifetime>
export const onLoad = createHook<IPageLt['onLoad']>('onLoad', ['Page'])
export const onUnload = createHook<IPageLt['onUnload']>('onUnload', 'Page')
export const onShow = createHook<IPageLt['onShow']>('onShow', ['Page', 'Component']) // 同 App
export const onHide = createHook<IPageLt['onHide']>('onHide', ['Page', 'Component'])
export const onResize = createHook<IPageLt['onResize']>('onResize', ['Page', 'Component'])
export const onReady = createHook<IPageLt['onReady']>('onReady', ['Page', 'Component'])

export const onPullDownRefresh = createHook<IPageLt['onPullDownRefresh']>('onPullDownRefresh', 'Page')
export const onReachBottom = createHook<IPageLt['onReachBottom']>('onReachBottom', 'Page')
export const onAddToFavorites = createHook<IPageLt['onAddToFavorites']>('onAddToFavorites', 'Page')
export const onTabItemTap = createHook<IPageLt['onTabItemTap']>('onTabItemTap', 'Page')
export const onSaveExitState = createHook<() => { data: any; expireTimeStamp: number }>('onSaveExitState', 'Page')
export const onShareAppMessage = createHook<IPageLt['onShareAppMessage']>('onShareAppMessage', 'Page', {
  validator: ins =>
    ins[CORE_KEY].options.enableShareAppMessage
      ? ''
      : 'onShareAppMessage 函数只有在 enableShareAppMessage 配置为 true 的时候才能使用',
})
export const onShareTimeline = createHook<IPageLt['onShareTimeline']>('onShareTimeline', 'Page', {
  validator: ins =>
    ins[CORE_KEY].options.enableShareTimeline
      ? ''
      : 'onShareTimeline 函数只有在 enableShareTimeline 配置为 true 的时候才能使用',
})
export const onPageScroll = createHook<IPageLt['onPageScroll']>('onPageScroll', 'Page', {
  validator: ins =>
    ins[CORE_KEY].options.enablePageScroll ? '' : 'onPageScroll 函数只有在 enablePageScroll 配置为 true 的时候才能使用',
})

/**
 * ====== Component Lifetime  ====
 */
type CLt = Required<WechatMiniprogram.Component.Lifetimes['lifetimes']>
// export const onError = createHook('error', 'Component') // 同 App
// export const onReady = createHook('ready') // 同 Page
export const onMoved = createHook<CLt['moved']>('moved', 'Component')
export const onDetached = createHook<CLt['detached']>('detached', 'Component')

/**
 * ====== Component PageLifetime  ====
 */

// export const onShow = createHook('show') // 同 Page
// export const onHide = createHook('hide') // 同 Page
// export const onResize = createHook('resize') // 同 Page
