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

export { createApp, useApp } from './app'
export { definePage } from './page'
export { defineComponent } from './component'

export {
  // app
  onAppLaunch,
  onAppShow,
  onAppHide,
  onAppPageNotFound,
  onAppUnhandledRejection,
  onAppThemeChange,
  onAppError,
  // page
  onLoad,
  onUnload,
  onShow,
  onHide,
  onResize,
  onReady,
  onPullDownRefresh,
  onReachBottom,
  onAddToFavorites,
  onTabItemTap,
  onSaveExitState,
  onShareAppMessage,
  onShareTimeline,
  onPageScroll,
  // component
  onMoved,
  onDetached,
  onError,
} from './lifetimes'

export type {
  Core,
  Instance,
  PageInstance,
  ComponentInstance,
  InstanceType,
  AppCustomContext,
  PageCustomContext,
  ComponentCustomContext,
} from './instance'
export type { AppOptions } from './app'
export type { Plugin, PluginOptions, PluginSetup } from './plugin'
