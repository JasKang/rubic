import { isRef } from '@vue/reactivity'
import { CORE_KEY } from './constants'
import { Instance } from './instance'
import { getCurrentInstance } from './instance'
import { isObject } from './util'
import { watch } from './watch'

export function watchBinding(this: Instance, key: string, value: unknown): void {
  if (!isObject(value)) {
    return
  }
  watch(
    isRef(value) ? value : () => value,
    () => {
      if (this[CORE_KEY].render.keys.indexOf(key) === -1) {
        this[CORE_KEY].render.keys.push(key)
      }
    },
    {
      deep: true,
    }
  )
}

export function watchRender(this: Instance) {
  const { keys } = this[CORE_KEY].render
  watch(
    () => keys,
    () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this[CORE_KEY].render.patchData()
      keys.splice(0, keys.length)
    },
    {
      deep: true,
      flush: 'post',
    }
  )
}

export function nextRender<T = void>(this: T, fn: (this: T) => void, ctx: Instance) {
  const currentCtx = ctx || getCurrentInstance()
  if (currentCtx) {
    const { effects } = currentCtx[CORE_KEY].render
    if (effects.indexOf(fn) === -1) {
      effects.push(fn)
    }
  }
}
