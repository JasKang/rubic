import { isProxy, isRef, toRaw } from '@vue/reactivity'
import type { Func } from './types'

export const NOOP = () => {}

export const toTypeString = (value: unknown): string => Object.prototype.toString.call(value)

export const { isArray } = Array
export const isFunction = (val: unknown): val is Func => typeof val === 'function'
export const isMap = (val: unknown): val is Map<any, any> => toTypeString(val) === '[object Map]'
export const isSet = (val: unknown): val is Set<any> => toTypeString(val) === '[object Set]'
export const isPlainObject = (val: unknown): val is Record<string, unknown> =>
  toTypeString(val) === '[object Object]'
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'
export const isPromise = <T = any>(val: unknown): val is Promise<T> =>
  isObject(val) && isFunction(val.then) && isFunction(val.catch)

export function isJsonType(x: unknown): boolean {
  const simpleTypes = new Set(['undefined', 'boolean', 'number', 'string'])
  return x === null || simpleTypes.has(typeof x)
}

// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)

export const remove = <T>(arr: T[], el: T) => {
  const i = arr.indexOf(el)
  if (i > -1) {
    arr.splice(i, 1)
  }
}

export function firstToUpper(str: string) {
  if (str.length > 0) {
    return str.trim().toLowerCase().replace(str[0], str[0].toUpperCase())
  }
  return ''
}

export function arrayToRecord<T extends readonly string[], R = any>(
  arr: T,
  func: (key: T[number]) => R
) {
  const obj = {} as { [key in T[number]]: R }
  for (const key of arr) {
    obj[key as T[number]] = func(key)
  }
  return obj
}

export function bindingToRaw(x: unknown): unknown {
  if (isJsonType(x) || isFunction(x)) {
    return x
  }
  if (isRef(x)) {
    return bindingToRaw(x.value)
  }
  if (isProxy(x)) {
    return bindingToRaw(toRaw(x))
  }
  if (isArray(x)) {
    return x.map(item => bindingToRaw(item))
  }
  if (isPlainObject(x)) {
    const obj: Record<string, unknown> = {}
    Object.keys(x).forEach(key => {
      obj[key] = bindingToRaw(x[key])
    })
    return obj
  }

  throw new TypeError(`${toTypeString(x)} value is not supported`)
}
