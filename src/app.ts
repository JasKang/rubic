import { APP_LIFETIMES, CORE_KEY } from './constants'
import { error } from './errorHandling'
import type { FlatType, Func } from './types'
import { arrayToRecord } from './util'

type LaunchOptions = FlatType<WechatMiniprogram.App.LaunchShowOption>

export type AppOption = {
  setup: (options: LaunchOptions) => AnyObject | void
}

export type AppCore = {
  hooks: {
    [key in typeof APP_LIFETIMES[number]]: Func[]
  }
  isPending: boolean
}

const appCore: AppCore = {
  hooks: arrayToRecord(APP_LIFETIMES, () => []),
  isPending: false,
}

function wrapAppHooks(): { [key in typeof APP_LIFETIMES[number]]: Func } {
  const lifeTimes = arrayToRecord<typeof APP_LIFETIMES, Func>(APP_LIFETIMES, funcKey => {
    return function (this: AnyObject, ...args: unknown[]) {
      const core: AppCore = this[CORE_KEY]
      const hooks = core.hooks[funcKey]
      let ret: unknown = undefined
      hooks.forEach((func: Func) => {
        ret = func(...args)
      })
      return ret
    }
  })
  return lifeTimes
}

function createAppHook<T extends Func>(lifetime: typeof APP_LIFETIMES[number]) {
  return function (hook: T) {
    const { hooks, isPending } = appCore
    if (isPending) {
      hooks[lifetime].push(hook)
    } else {
      error(
        new Error(`${lifetime.replace('on', 'onApp')} 函数必须在 createApp -> setup 期间同步使用.`)
      )
    }
  }
}

export function createApp(options: AppOption) {
  const { setup } = options
  const onLaunch = function (
    this: WechatMiniprogram.App.Instance<AnyObject>,
    launchOptions: LaunchOptions
  ) {
    appCore.isPending = true
    const bindings: AnyObject = setup(launchOptions) || {}
    appCore.isPending = false
    if (bindings) {
      Object.keys(bindings).forEach(key => {
        this[key] = bindings[key]
      })
    }
  }
  appCore.isPending = false
  return App({
    [CORE_KEY]: appCore,
    onLaunch,
    ...wrapAppHooks(),
  })
}

/**
 * ====== App Lifetime  ====
 */

export const onAppShow = createAppHook('onShow')
export const onAppHide = createAppHook('onHide')
export const onAppError = createAppHook('onError')
export const onAppPageNotFound = createAppHook('onPageNotFound')
export const onAppUnhandledRejection = createAppHook('onUnhandledRejection')
export const onAppThemeChange = createAppHook('onThemeChange')
