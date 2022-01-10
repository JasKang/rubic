import type { EffectScope, ShallowReactive } from '@vue/reactivity'
import { reactive, shallowReactive } from '@vue/reactivity'
import type { HookType } from './constants'
import { CORE_KEY, COMPONENT_LIFETIMES, PAGE_LIFETIMES, PAGE_ON_METHODS } from './constants'

import type { Data, Expand, Func } from './types'
import { arrayToRecord, bindingToRaw } from './util'

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
  scope?: EffectScope
  bindings: Record<string, any>
  render: {
    effects: Array<() => void>
    keys: string[]
    patchData: () => Promise<void>
  }
  nextRender(this: Instance, fn: (this: Instance) => void): void
}

export type PageInstance = Expand<
  WechatMiniprogram.Component.Instance<Data, {}, { [x: string]: Func }, { [CORE_KEY]: Core }, true>
>

export type ComponentInstance = Expand<
  WechatMiniprogram.Component.Instance<Data, {}, { [x: string]: Func }, { [CORE_KEY]: Core }, false>
>

export type Instance = PageInstance | ComponentInstance

let currentInstance: Instance | null = null

export function setCurrentInstance(instance: Instance | null) {
  if (instance) {
    instance[CORE_KEY].scope?.on()
  } else {
    currentInstance?.[CORE_KEY].scope?.off()
  }
  currentInstance = instance
}

export function getCurrentInstance() {
  return currentInstance
}

export function createCore(isPage: boolean): Core {
  return {
    props: shallowReactive<Record<string, any>>({}),
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
      patchData(this: Instance) {
        return new Promise(resolve => {
          const { keys } = this[CORE_KEY].render
          if (keys.length > 0) {
            const patchObj: Record<string, any> = {}
            for (const key of keys) {
              patchObj[key] = bindingToRaw(this[CORE_KEY].bindings[key])
            }
            this.setData(patchObj, () => {
              const { effects } = this[CORE_KEY].render
              for (const effect of effects) {
                effect()
              }
              this[CORE_KEY].render.effects = []
              resolve()
            })
          }
        })
      },
    },
    nextRender(this: Instance, fn: (this: Instance) => void) {
      const { effects } = this[CORE_KEY].render
      if (effects.indexOf(fn) === -1) {
        effects.push(fn)
      }
    },
  }
}
