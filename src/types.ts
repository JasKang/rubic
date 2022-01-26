export type Func = (...args: any) => any

export type Data = Record<string, unknown>

export type AnyObject = Record<string, any>

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

export type LooseRequired<T> = { [P in string & keyof T]: T[P] }

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

export type FlatType<T> = T extends Func
  ? T
  : T extends object
  ? { [K in keyof T]: FlatType<T[K]> }
  : T
