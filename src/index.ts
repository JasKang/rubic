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
export {
  createApp,
  AppOption,
  onAppShow,
  onAppHide,
  onAppError,
  onAppPageNotFound,
  onAppUnhandledRejection,
  onAppThemeChange,
} from './core/app'
export { defineComponent, definePage } from './core/component'
export { getCurrentInstance, CustomPageContext, CustomComponentContext } from './core/instance'
export { CORE_KEY } from './core/constants'
export { watch, watchEffect } from './core/watch'

export {
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
