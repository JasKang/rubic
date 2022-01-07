export type Func = (...args: any[]) => any

export type Data = Record<string, unknown>

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T

export type SizeEvent = {
  size: {
    /** 变化后的窗口宽度，单位 px */
    windowWidth: number
    /** 变化后的窗口高度，单位 px */
    windowHeight: number
  }
}
