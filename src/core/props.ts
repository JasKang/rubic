import type { Data, Expand } from './types'
import { isPlainObject } from './util'

type PropConstructor<T = any> = { new (...args: any[]): T & {} } | { (): T } | PropMethod<T>

type PropMethod<T, TConstructor = any> = [T] extends [((...args: any) => any) | undefined] // if is function with args, allowing non-required functions
  ? { new (): TConstructor; (): T; readonly prototype: TConstructor } // Create Function like constructor
  : never

type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends
    | { value: any }
    // don't mark Boolean props as undefined
    | BooleanConstructor
    | { type: BooleanConstructor }
    ? T[K] extends { value: undefined | (() => undefined) }
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
  : [T] extends [DateConstructor | { type: DateConstructor }]
  ? Date
  : [T] extends [(infer U)[] | { type: (infer U)[] }]
  ? U extends DateConstructor
    ? Date | InferPropType<U>
    : InferPropType<U>
  : [T] extends [Prop<infer V, infer D>]
  ? unknown extends V
    ? D
    : V
  : T

type ExtractPropTypes<O> = O extends object
  ? { [K in RequiredKeys<O>]: InferPropType<O[K]> } & {
      // This is needed to keep the relation between the option prop and the props, allowing to use ctrl+click to navigate to the prop options. see: #3656
      [K in OptionalKeys<O>]?: InferPropType<O[K]>
    }
  : { [K in string]: any }

export type PropsRaw<O> = Expand<Readonly<ExtractPropTypes<O>>>

export type PropType<T> = PropConstructor<T> | PropConstructor<T>[]

interface PropOptions<T = any, D = T> {
  type?: PropType<T> | null
  value?: D | null
}

type Prop<T, D = T> = PropOptions<T, D> | PropType<T>

export type ComponentPropsOptions<P = Data> = {
  [K in keyof P]: Prop<P[K]>
}

// function getType(ctor: Prop<any>): string {
//   const match = ctor && ctor.toString().match(/^\s*function (\w+)/)
//   return match ? match[1] : ctor === null ? 'null' : ''
// }

export function convertToProperties(props: ComponentPropsOptions) {
  const properties: Record<string, any> = {}
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
      properties[key] = _prop
    } else {
      properties[key] = {
        type: prop,
      }
    }
  })
  return properties
}
