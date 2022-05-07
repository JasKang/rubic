import type { ComponentBaseOptions } from './component'
import type { PageBaseOptions } from './page'
import type { AnyObject } from './types'
import { config } from './config'
import { warn } from './errorHandling'

export type OptionsProcess = (options: PageBaseOptions | ComponentBaseOptions) => PageBaseOptions | ComponentBaseOptions

export type SetupProcess = (props: Record<string, any>, ctx: any, next?: () => AnyObject) => AnyObject

export interface Middleware {
  name: string
  type: 'Page' | 'Component' | Array<'Page' | 'Component'>
  optionsProcess?: OptionsProcess
  setupProcess?: SetupProcess
}

/**
 * 插件存储
 */
const installedMiddlewares = new Set<Middleware>()

export function compose(setupGroup: SetupProcess[], instance: any) {
  return function (props: Record<string, any>, ctx: any, next: SetupProcess): AnyObject {
    let index = -1

    function dispatch(i: number): AnyObject {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }
      if (i === setupGroup.length) {
        return next.call(instance, props, ctx)
      }

      index = i
      const setup = setupGroup[i]
      if (!setup) return {} as AnyObject

      if (setup.length > 2) {
        return setup.call(instance, props, ctx, function next() {
          return dispatch(i + 1)
        })
      } else {
        const bindings = setup.call(instance, props, ctx)
        return { ...bindings, ...dispatch(i + 1) }
      }
    }

    return dispatch(0)
  }
}

export function useMiddleware(middleware: Middleware | Middleware[]) {
  const middlewares = Array.isArray(middleware) ? middleware : [middleware]
  for (const item of middlewares) {
    if (installedMiddlewares.has(item)) {
      warn(`中间件 ${item.name} 重复注册`)
    } else {
      installedMiddlewares.add(item)
    }
  }
}

export function loadMiddlewares<T>(originOptions: T, type: 'Page' | 'Component') {
  let options: T = originOptions
  // @ts-ignore
  const originSetup = originOptions.setup

  const setupGroup: SetupProcess[] = []

  const pageMiddlewares: Middleware[] = (config.get('pageMiddlewares') || []).map(m => {
    if (typeof m === 'function') {
      return { setupProcess: m, type: 'Page', name: 'dummy' }
    }
    return { ...m, type: 'Page', name: 'dummy' }
  })
  const componentMiddlewares: Middleware[] = (config.get('componentMiddlewares') || []).map(m => {
    if (typeof m === 'function') {
      return { setupProcess: m, type: 'Component', name: 'dummy' }
    }
    return { ...m, type: 'Component', name: 'dummy' }
  })

  const installedMiddlewares: Middleware[] = [...pageMiddlewares, ...componentMiddlewares]

  for (const middleware of installedMiddlewares) {
    const { type: _type, optionsProcess, setupProcess } = middleware || {}
    const middlewareType = Array.isArray(_type) ? _type : [_type]

    if (middlewareType.indexOf(type) !== -1) {
      if (optionsProcess) {
        options = (optionsProcess(options as any) || options) as any
      }
      if (setupProcess) {
        setupGroup.push(setupProcess)
      }
    }
  }

  function setupWrap(props: any, ctx: any) {
    // @ts-ignore
    const setup = compose(setupGroup, this)
    return setup(props, ctx, originSetup)
  }

  return {
    options,
    setup: setupWrap,
  }
}
