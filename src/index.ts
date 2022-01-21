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
} from './app'
export { defineComponent, definePage } from './component'
export { getCurrentInstance, CustomPageContext, CustomComponentContext } from './instance'
export { CORE_KEY } from './constants'
export { watch, watchEffect } from './watch'

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
} from './lifetimes'
