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

export function bindingToData(x: unknown, key: string): unknown {
  if (isJsonType(x) || isFunction(x)) {
    return x
  }
  if (isRef(x)) {
    return bindingToData(x.value, key)
  }
  if (isProxy(x)) {
    return bindingToData(toRaw(x), key)
  }
  if (isArray(x)) {
    return x.map(item => bindingToData(item, key))
  }
  if (isPlainObject(x)) {
    const obj: Record<string, unknown> = {}
    Object.keys(x).forEach(key => {
      obj[key] = bindingToData(x[key], key)
    })
    return obj
  }
  throw new Error(
    `错误的数据类型 ${key}\:${toTypeString(
      x
    )}, 小程序 data 仅支持 string | number | boolean | object | array 类型.`
  )
}
