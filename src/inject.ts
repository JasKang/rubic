import { warn } from './errorHandling'
import { isFunction } from './utils'

export interface InjectionKey<T> extends Symbol {}
/**
 * provides 存在全局对象上
 */
const provides = Object.create(null)

export function provide<T>(key: InjectionKey<T> | string, value: T): void {
  provides[key as string] = value
}

export function inject<T>(key: InjectionKey<T> | string): T | undefined
export function inject<T>(key: InjectionKey<T> | string, defaultValue: T, treatDefaultAsFactory?: false): T
export function inject<T>(key: InjectionKey<T> | string, defaultValue: T | (() => T), treatDefaultAsFactory: true): T
export function inject(
  key: InjectionKey<any> | string,
  defaultValue?: unknown,
  treatDefaultAsFactory = false
): unknown {
  if ((key as string | symbol) in provides) {
    return provides[key as string]
  }

  if (arguments.length > 1) {
    return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue() : defaultValue
  }

  warn(`injection "${String(key)}" not found.`)

  return undefined
}
