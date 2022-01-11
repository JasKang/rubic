import { CORE_KEY } from './constants'
import { appCore } from './instance'
import { wrapAppHooks } from './lifetimes'
import type { Expand } from './types'

type LaunchOptions = Expand<WechatMiniprogram.App.LaunchShowOption>

export type AppOption = {
  setup: (options: LaunchOptions) => Record<string, any> | undefined
}

export function createApp(options: AppOption) {
  const { setup } = options
  const onLaunch = function (
    this: WechatMiniprogram.App.Instance<Record<string, any>>,
    launchOptions: LaunchOptions
  ) {
    appCore.isPending = true
    const bindings: Record<string, any> = setup(launchOptions) || {}
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
