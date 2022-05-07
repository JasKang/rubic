import { isRef } from '@vue/reactivity'
import type { Instance } from './instance'
import { bindingToData } from './bindings'
import { CORE_KEY } from './constants'
import { isObject } from './utils'
import { watch } from './watch'

export function watchBinding(this: Instance, key: string, value: unknown): void {
  if (!isObject(value)) {
    return
  }
  watch(
    isRef(value) ? value : () => value,
    () => {
      if (this[CORE_KEY].renderQueue.keys.indexOf(key) === -1) {
        this[CORE_KEY].renderQueue.keys.push(key)
      }
    },
    {
      deep: true,
    }
  )
}

export function watchRender(this: Instance) {
  const { keys } = this[CORE_KEY].renderQueue
  watch(
    () => keys,
    () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this[CORE_KEY].renderQueue.render()
      keys.splice(0, keys.length)
    },
    {
      deep: true,
      // 支持 render 需要在最后
      flush: 'post',
    }
  )
}

export const createRender = (instance: Instance) => {
  return () => {
    const { keys } = instance[CORE_KEY].renderQueue
    return new Promise<void>(resolve => {
      if (keys.length > 0) {
        const patchObj: Record<string, any> = {}
        for (const key of keys) {
          patchObj[key] = bindingToData(instance[CORE_KEY].bindings[key], key)
        }
        instance.setData(patchObj, () => {
          const { effects } = instance[CORE_KEY].renderQueue
          for (const effect of effects) {
            effect()
          }
          instance[CORE_KEY].renderQueue.effects = []
          resolve()
        })
      }
    })
  }
}
