import type { Data, IfAny } from './types'
import { isPlainObject } from './utils'

type PropMethod<T, TConstructor = any> = [T] extends [((...args: any) => any) | undefined] // if is function with args, allowing non-required functions
  ? { new (): TConstructor; (): T; readonly prototype: TConstructor } // Create Function like constructor
  : never

type PropConstructor<T = any> = { new (...args: any[]): T & {} } | { (): T } | PropMethod<T>

export type PropType<T> = PropConstructor<T> | PropConstructor<T>[]

export interface PropOptions<T = any, D = T> {
  type?: PropType<T> | true | null
  value?: D
}

export type Prop<T, D = T> = PropOptions<T, D> | PropType<T>

export type NormalizedProps = Record<string, PropOptions>

export type ComponentObjectPropsOptions<P = Data> = {
  [K in keyof P]: Prop<P[K]> | null
}

export type ComponentPropsOptions<P = Data> = string[] | ComponentObjectPropsOptions<P>

type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends
    | { value: any }
    // don't mark Boolean props as undefined
    | BooleanConstructor
    | { type: BooleanConstructor }
    ? T[K] extends { value: undefined }
      ? never
      : K
    : never
}[keyof T]

type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>

type InferPropType<T> = [T] extends [null]
  ? any // null & true would fail to infer
  : [T] extends [{ type: null | true }]
  ? any // As TS issue https://github.com/Microsoft/TypeScript/issues/14829 // somehow `ObjectConstructor` when inferred from { (): T } becomes `any` // `BooleanConstructor` when inferred from PropConstructor(with PropMethod) becomes `Boolean`
  : [T] extends [ObjectConstructor | { type: ObjectConstructor }]
  ? Record<string, any>
  : [T] extends [BooleanConstructor | { type: BooleanConstructor }]
  ? boolean
  : [T] extends [(infer U)[] | { type: (infer U)[] }]
  ? InferPropType<U>
  : [T] extends [Prop<infer V, infer D>]
  ? unknown extends V
    ? IfAny<V, V, D>
    : V
  : T

export type ExtractPropTypes<O> = {
  [K in keyof Pick<O, RequiredKeys<O>>]: InferPropType<O[K]>
} & {
  [K in keyof Pick<O, OptionalKeys<O>>]?: InferPropType<O[K]>
}

export function convertProps(props: ComponentPropsOptions) {
  const properties: Record<string, any> = {}
  if (Array.isArray(props)) {
    props.forEach(prop => {
      properties[prop] = {
        type: null,
      }
    })
  } else {
    Object.keys(props).forEach(key => {
      const prop = props[key]
      if (Array.isArray(prop)) {
        const [t, ...ts] = prop
        properties[key] = {
          type: [t],
          optionalTypes: ts,
        }
      } else if (isPlainObject(prop)) {
        const _prop: any = { ...prop }
        if (Array.isArray(prop.type)) {
          const [t, ...ts] = prop.type
          _prop.type = t
          _prop.optionalTypes = ts
        }
        // TODO: value 要不要处理
        properties[key] = _prop
      } else {
        properties[key] = {
          type: prop,
        }
      }
    })
  }

  return properties
}
