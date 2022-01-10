import type { HookType } from './constants'
import { PAGE_ON_METHODS, CORE_KEY, COMPONENT_LIFETIMES, PAGE_LIFETIMES } from './constants'
import { getCurrentInstance } from './instance'
import { error } from './errorHandling'
import type { Func } from './types'
import { firstToUpper } from './util'

type AllHook = HookType['Lifetime'] | HookType['PageLifetime'] | HookType['Method']

function isLifetimeType(key: string): key is HookType['Lifetime'] {
  return COMPONENT_LIFETIMES.indexOf(key as unknown as any) >= 0
}
function isPageLifetimeType(key: string): key is HookType['PageLifetime'] {
  return PAGE_LIFETIMES.indexOf(key as unknown as any) >= 0
}
function isPageMethodType(key: string): key is HookType['Method'] {
  return PAGE_ON_METHODS.indexOf(key as unknown as any) >= 0
}

function getLifetimeHooks(lifetime: AllHook) {
  const ins = getCurrentInstance()
  let key: AllHook = lifetime
  if (ins) {
    const isPage = ins[CORE_KEY].isPage
    const overwriteKey = `on${firstToUpper(key)}`
    if (isPage && isPageMethodType(overwriteKey)) {
      key = overwriteKey
    }
    if (isLifetimeType(key)) {
      return ins[CORE_KEY].hooks.lifetimes[key]
    } else if (isPageLifetimeType(key)) {
      return ins[CORE_KEY].hooks.pageLifetimes[key]
    } else {
      if (isPage) {
        return ins[CORE_KEY].hooks.methods[key]
      } else {
        return `当前实例是组件 无法创建 Page 钩子:${key}.`
      }
    }
  } else {
    return `当前没有实例 无法创建${key}钩子.`
  }
}

function createHook<T extends Func>(lifetime: AllHook, wrapFunc?: (func: T) => ReturnType<T>) {
  return (hook: T): void => {
    const hooks = getLifetimeHooks(lifetime)
    if (Array.isArray(hooks)) {
      hooks.push(wrapFunc || hook)
    } else {
      error(new Error(hooks))
    }
  }
}
/**
 * ====== Lifetime  ====
 */

export const onReady = createHook('ready')
export const onMoved = createHook('moved')
export const onDetached = createHook('detached')
export const onError = createHook('error')

/**
 * ====== PageLifetime  ====
 */

export const onShow = createHook('show')
export const onHide = createHook('hide')
export const onResize = createHook('resize')

/**
 * ====== Method  ====
 */

export const onLoad = createHook('onLoad')
// export const onReady = createHook('onReady') // Lifetime 公用
export const onUnload = createHook('onUnload')
export const onPullDownRefresh = createHook('onPullDownRefresh')
export const onReachBottom = createHook('onReachBottom')
export const onPageScroll = createHook('onPageScroll')
// export const onResize = createHook('onResize') // PageLifetime 公用
export const onShareAppMessage = createHook('onShareAppMessage')
export const onShareTimeline = createHook('onShareTimeline')
export const onAddToFavorites = createHook('onAddToFavorites')
