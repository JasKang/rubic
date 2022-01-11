export const CORE_KEY = '__j_core__' as const

export const APP_LIFETIMES = [
  'onShow',
  'onHide',
  'onError',
  'onPageNotFound',
  'onUnhandledRejection',
  'onThemeChange',
] as const

export const COMPONENT_LIFETIMES = ['ready', 'moved', 'detached', 'error'] as const
export const PAGE_LIFETIMES = ['show', 'hide', 'resize'] as const
export const PAGE_ON_METHODS = [
  'onLoad',
  'onReady',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onPageScroll',
  'onResize',
  'onShareAppMessage',
  'onShareTimeline',
  'onAddToFavorites',
] as const

// onLoad(query) {},
// onReady() {},
// onUnload() {},
// onPullDownRefresh() {},
// onReachBottom() {},
// onPageScroll(options) {},
// onTabItemTap(options) {},
// onResize(options) {},
// onShareAppMessage(options): ICustomShareContent {},
// onShareTimeline(): ICustomTimelineContent {},
// onAddToFavorites(options): IAddToFavoritesContent {},

export type HookType = {
  Lifetime: typeof COMPONENT_LIFETIMES[number]
  PageLifetime: typeof PAGE_LIFETIMES[number]
  Method: typeof PAGE_ON_METHODS[number]
}
