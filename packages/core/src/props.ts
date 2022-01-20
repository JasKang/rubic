import type { Data, Expand, IfAny } from './types'
import { isPlainObject } from './util'

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

// type DefaultKeys<T> = {
//   [K in keyof T]: T[K] extends
//     | { default: any }
//     // Boolean implicitly defaults to false
//     | BooleanConstructor
//     | { type: BooleanConstructor }
//     ? T[K] extends { type: BooleanConstructor; required: true } // not default if Boolean is marked as required
//       ? never
//       : K
//     : never
// }[keyof T]

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
  // use `keyof Pick<O, RequiredKeys<O>>` instead of `RequiredKeys<O>` to support IDE features
  [K in keyof Pick<O, RequiredKeys<O>>]: InferPropType<O[K]>
} & {
  // use `keyof Pick<O, OptionalKeys<O>>` instead of `OptionalKeys<O>` to support IDE features
  [K in keyof Pick<O, OptionalKeys<O>>]?: InferPropType<O[K]>
}

export function convertToProperties(props: ComponentPropsOptions) {
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

// type ToUnion<T> = T extends Array<infer A> //
//   ? ToUnion<A>
//   : T extends null
//   ? any
//   : T extends StringConstructor
//   ? string
//   : T extends NumberConstructor
//   ? number
//   : T extends BooleanConstructor
//   ? boolean
//   : T extends ArrayConstructor
//   ? any[]
//   : T extends ObjectConstructor
//   ? AnyObject
//   : never

// type Props<P> = {
//   [key in keyof P]: P[key] extends { type: infer A } ? ToUnion<A> : ToUnion<P[key]>
// }

// declare function VueBasicProps<P extends ComponentPropsOptions>(options: {
//   data(this: Props<P>): void
//   props: P
// }): any

// VueBasicProps({
//   props: ['a', 'c'] as const,
//   data() {
//     this.a
//     this.b
//   },
// })
// type a = ToUnion<typeof String>
