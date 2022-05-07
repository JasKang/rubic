import { isProxy, isRef, toRaw, type Ref } from '@vue/reactivity'
import { isArray, isFunction, isBaseType, isPlainObject, toTypeString } from './utils'

export function bindingToData(x: any, key: string): any {
  if (isBaseType(x) || isFunction(x)) {
    return x
  }
  if (isRef(x)) {
    return bindingToData((x as Ref<any>).value, key)
  }
  if (isProxy(x)) {
    return bindingToData(toRaw(x), key)
  }
  if (isArray(x)) {
    return (x as any[]).map(item => bindingToData(item, key))
  }
  if (isPlainObject(x)) {
    const obj: Record<string, any> = {}
    Object.keys(x).forEach(key => {
      obj[key] = bindingToData(x[key], key)
    })
    return obj
  }
  throw new Error(
    `错误的数据类型 ${key}:${toTypeString(
      x
    )}, 小程序 data 仅支持可以转成 JSON 的类型(string | number | boolean | object | array)`
  )
}
