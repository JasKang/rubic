export {
  ref,
  reactive,
  toRaw,
  toRef,
  toRefs,
  computed,
  readonly,
  shallowReadonly,
  shallowReactive,
  ComputedRef,
  Ref,
} from '@vue/reactivity'
export { createApp, AppOption } from './core/app'
export { defineComponent, definePage } from './core/component'
export { getCurrentInstance, CustomPageContext, CustomComponentContext } from './core/instance'
export { watch, watchEffect } from './core/watch'

export {
  onAppShow,
  onAppHide,
  onAppError,
  onAppPageNotFound,
  onAppUnhandledRejection,
  onAppThemeChange,
  //
  onReady,
  onMoved,
  onDetached,
  onError,
  //
  onShow,
  onHide,
  onResize,
  //
  onLoad,
  onUnload,
  onPullDownRefresh,
  onReachBottom,
  onPageScroll,
  onShareAppMessage,
  onShareTimeline,
  onAddToFavorites,
} from './core/lifetimes'
