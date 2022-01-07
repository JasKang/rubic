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
export { createApp } from './app'
export { defineComponent, definePage } from './component'
export { getCurrentInstance } from './core'
export { nextRender } from './bindings'
export { watch, watchEffect } from './watch'

export {
  onReady,
  onMoved,
  onDetached,
  onError,
  onShow,
  onHide,
  onResize,
  onLoad,
  onUnload,
  onPullDownRefresh,
  onReachBottom,
  onPageScroll,
  onShareAppMessage,
  onShareTimeline,
  onAddToFavorites,
} from './apiLifetime'
