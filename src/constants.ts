export const CORE_KEY = '__j_core__'

export const APP_LIFETIMES = [
  'onLaunch',
  'onShow',
  'onHide',
  'onError',
  'onPageNotFound',
  'onUnhandledRejection',
  'onThemeChange',
] as const

export const COMPONENT_LIFETIMES = ['ready', 'moved', 'detached', 'error'] as const
export const COMPONENT_PAGE_LIFETIMES = ['show', 'hide', 'resize'] as const
export const COMPONENT_METHOD_LIFETIMES = [
  'onLoad',
  'onReady',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onShareAppMessage',
  'onShareTimeline',
  'onAddToFavorites',
  'onPageScroll',
  'onTabItemTap',
  'onSaveExitState',
] as const

export type HookType = {
  App: typeof APP_LIFETIMES[number]
  Component: typeof COMPONENT_LIFETIMES[number]
  ComponentPage: typeof COMPONENT_PAGE_LIFETIMES[number]
  ComponentMethods: typeof COMPONENT_METHOD_LIFETIMES[number]
}
