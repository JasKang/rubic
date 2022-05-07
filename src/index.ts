export {
  // Core
  reactive,
  ref,
  readonly,
  shallowRef,
  triggerRef,
  // Utilities
  unref,
  isRef,
  toRef,
  toRefs,
  isProxy,
  isReactive,
  isReadonly,
  effectScope,
  EffectScope,
  ITERATE_KEY,
  // Advanced
  markRaw,
  toRaw,
  computed,
  // type
  ReactiveEffect,
  TrackOpTypes,
  TriggerOpTypes,
} from '@vue/reactivity'
export type {
  ReactiveEffectOptions,
  DebuggerEvent,
  Ref,
  ComputedRef,
  WritableComputedRef,
  UnwrapRef,
  ShallowUnwrapRef,
  WritableComputedOptions,
  ToRefs,
  DeepReadonly,
} from '@vue/reactivity'

export { watch, watchEffect, watchPostEffect, watchSyncEffect } from './watch'
export { nextTick } from './scheduler'
export { CORE_KEY } from './constants'
export { provide, inject } from './inject'
export type { InjectionKey } from './inject'
export { getCurrentInstance } from './instance'
export type {
  // type
  Core,
  Instance,
  PageInstance,
  ComponentInstance,
  InstanceType,
  AppCustomContext,
  PageCustomContext,
  ComponentCustomContext,
} from './instance'
export { createApp, getAppContext } from './app'
export type {
  // type
  AppOptions,
} from './app'
export { definePage } from './page'
export { defineComponent } from './component'
export { router } from './router'
export { useMiddleware } from './middleware'
export type {
  // type
  Middleware,
  OptionsProcess,
  SetupProcess,
} from './middleware'

export {
  // app
  onLaunch,
  onAppShow,
  onAppHide,
  onPageNotFound,
  onUnhandledRejection,
  onThemeChange,
  onError,
  // page
  onShow,
  onHide,
  onLoad,
  onResize,
  onReady,
  onUnload,
  onPullDownRefresh,
  onReachBottom,
  onShareAppMessage,
  onShareTimeline,
  onAddToFavorites,
  onPageScroll,
  onTabItemTap,
  onSaveExitState,
  // component
  onMoved,
  onDetached,
} from './lifetimes'
