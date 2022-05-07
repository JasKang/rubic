export type Func = (...args: any) => any

export type Data = Record<string, unknown>

export type AnyObject = Record<string, any>

export type LooseRequired<T> = { [P in string & keyof T]: T[P] }

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

export type Flat<T> = T extends Func ? T : T extends object ? { [K in keyof T]: T[K] } : T

export type FlatDeep<T> = T extends Func ? T : T extends object ? { [K in keyof T]: FlatDeep<T[K]> } : T
