import type { ShallowReactive } from '@vue/reactivity'
import { reactive, shallowReactive, EffectScope } from '@vue/reactivity'
import type { HookType } from './constants'
import {
  CORE_KEY,
  APP_LIFETIMES,
  COMPONENT_LIFETIMES,
  COMPONENT_PAGE_LIFETIMES,
  COMPONENT_METHOD_LIFETIMES,
} from './constants'
import { createRender } from './renderer'

import type { Data, Flat, Func } from './types'
import { keysToRecord } from './utils'

export type NextTick = (fn: () => void) => void

export type InstanceType = 'App' | 'Page' | 'Component'

export type Core = {
  props: ShallowReactive<Record<string, any>>
  type: InstanceType
  isUnmounted: boolean
  hooks:
    | { [key in HookType['App']]?: Func[] }
    | {
        lifetimes: {
          [key in HookType['Component']]: Func[]
        }
        pageLifetimes: {
          [key in HookType['ComponentPage']]: Func[]
        }
        methods: {
          [key in HookType['ComponentMethods']]: Func[]
        }
      }
  scope: EffectScope
  bindings: Record<string, any>
  renderQueue: {
    effects: Array<() => void>
    keys: string[]
    render: () => Promise<void>
  }
  nextTick: NextTick
  initHooks(type: InstanceType): Core
}

export interface AppCustomContext {}
export interface PageCustomContext {}
export interface ComponentCustomContext {}

export type InstanceCore = { [CORE_KEY]: Core; nextTick: NextTick }

type BaseInstance<D, C, P extends boolean = false> = Flat<
  WechatMiniprogram.Component.Instance<D, {}, {}, InstanceCore & C, P>
>

export type PageInstance = BaseInstance<Data, PageCustomContext, true>

export type ComponentInstance = BaseInstance<Data, ComponentCustomContext, false>

export type Instance = PageInstance | ComponentInstance

let currentInstance: Instance | null = null

export function setCurrentInstance(instance: Instance | null) {
  if (instance) {
    // @ts-ignore
    instance[CORE_KEY].scope.on()
  } else {
    if (currentInstance) {
      // @ts-ignore
      currentInstance[CORE_KEY].scope.off()
    }
  }
  currentInstance = instance
}

export function getCurrentInstance() {
  return currentInstance
}

export function createCore(instance: any): Core {
  const core: Core = {
    props: shallowReactive<Record<string, any>>({}),
    scope: new EffectScope(),
    type: 'Page' as InstanceType,
    isUnmounted: false,
    hooks: {},
    bindings: {},
    renderQueue: {
      effects: [],
      keys: reactive<string[]>([]),
      render: createRender(instance),
    },
    nextTick(fn: (this: Instance) => void) {
      const { effects } = instance[CORE_KEY].renderQueue
      if (effects.indexOf(fn) === -1) {
        effects.push(fn)
      }
    },
    initHooks(type: InstanceType) {
      this.type = type
      this.hooks =
        type === 'App'
          ? keysToRecord(APP_LIFETIMES, () => [])
          : {
              lifetimes: keysToRecord(COMPONENT_LIFETIMES, () => []),
              pageLifetimes: keysToRecord(COMPONENT_PAGE_LIFETIMES, () => []),
              methods: keysToRecord(COMPONENT_METHOD_LIFETIMES, () => []),
            }
      return this
    },
  }

  return core
}
