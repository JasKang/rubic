import type { ShallowReactive } from '@vue/reactivity'
import { reactive, shallowReactive, EffectScope } from '@vue/reactivity'
import type { HookType } from './constants'
import {
  APP_LIFETIMES,
  CORE_KEY,
  COMPONENT_LIFETIMES,
  PAGE_LIFETIMES,
  PAGE_ON_METHODS,
} from './constants'

import type { Data, Func } from './types'
import { arrayToRecord, bindingToRaw } from './util'

export type NextRender = (fn: () => void) => void

export type Core = {
  props: ShallowReactive<Record<string, any>>
  isPage: boolean
  hooks: {
    lifetimes: {
      [key in HookType['Lifetime']]: Func[]
    }
    pageLifetimes: {
      [key in HookType['PageLifetime']]: Func[]
    }
    methods: {
      [key in HookType['Method']]: Func[]
    }
  }
  scope: EffectScope
  bindings: Record<string, any>
  render: {
    effects: Array<() => void>
    keys: string[]
    patchData: () => Promise<void>
  }
  nextRender: NextRender
}

export interface CustomPageContext {}
export interface CustomComponentContext {}

export type InstanceCore = { [CORE_KEY]: Core; $nextRender: NextRender }

export type PageInstance = WechatMiniprogram.Component.Instance<
  Data,
  {},
  {},
  InstanceCore & CustomPageContext,
  true
>

export type ComponentInstance = WechatMiniprogram.Component.Instance<
  Data,
  {},
  {},
  InstanceCore & CustomComponentContext,
  false
>

export type Instance = PageInstance | ComponentInstance

let currentInstance: Instance | null = null

export function setCurrentInstance(instance: Instance | null) {
  if (instance) {
    instance[CORE_KEY].scope.on()
  } else {
    if (currentInstance) {
      currentInstance[CORE_KEY].scope.off()
    }
  }
  currentInstance = instance
}

export function getCurrentInstance() {
  return currentInstance
}

export function createCore(instance: Instance, isPage: boolean): Core {
  return {
    props: shallowReactive<Record<string, any>>({}),
    scope: new EffectScope(),
    isPage: isPage,
    hooks: {
      lifetimes: arrayToRecord(COMPONENT_LIFETIMES, () => []),
      pageLifetimes: arrayToRecord(PAGE_LIFETIMES, () => []),
      methods: arrayToRecord(PAGE_ON_METHODS, () => []),
    },
    bindings: {},
    render: {
      effects: [],
      keys: reactive<string[]>([]),
      patchData() {
        return new Promise(resolve => {
          const { keys } = instance[CORE_KEY].render
          if (keys.length > 0) {
            const patchObj: Record<string, any> = {}
            for (const key of keys) {
              patchObj[key] = bindingToRaw(instance[CORE_KEY].bindings[key], key)
            }
            instance.setData(patchObj, () => {
              const { effects } = instance[CORE_KEY].render
              for (const effect of effects) {
                effect()
              }
              instance[CORE_KEY].render.effects = []
              resolve()
            })
          }
        })
      },
    },
    nextRender(fn: (this: Instance) => void) {
      const { effects } = instance[CORE_KEY].render
      if (effects.indexOf(fn) === -1) {
        effects.push(fn)
      }
    },
  }
}
