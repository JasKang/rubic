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
export { createApp } from './core/app'
export { defineComponent, definePage } from './core/component'
export { getCurrentInstance } from './core/instance'
export { nextRender } from './core/bindings'
export { watch, watchEffect } from './core/watch'

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
} from './core/lifetimes'
