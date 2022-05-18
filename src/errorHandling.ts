import { pauseTracking, resetTracking } from '@vue/reactivity'
import { isArray, isPromise } from './utils'
import type { Instance } from './instance'
import type { Func } from './types'

export const enum ErrorTypes {
  setup_function = 'setup function',
  render_function = 'render function',
  watch_getter = 'watcher getter',
  watch_callback = 'watcher callback',
  watch_cleanup = 'watcher cleanup function',
  native_event_handler = 'native event handler',
  component_event_handler = 'component event handler',
  vnode_hook = 'vnode hook',
  directive_hook = 'directive hook',
  transition_hook = 'transition hook',
  app_error_handler = 'app errorHandler',
  app_warn_handler = 'app warnHandler',
  function_ref = 'ref function',
  async_component_loader = 'async component loader',
  scheduler = 'scheduler flush',
}

export function callWithErrorHandling(fn: Function, instance: Instance | null, type: ErrorTypes, args?: unknown[]) {
  let res
  try {
    res = args ? fn(...args) : fn()
  } catch (err: unknown) {
    handleError(err as Error, instance, type)
  }
  return res
}

export function callWithAsyncErrorHandling(
  fn: Func[] | Func,
  instance: Instance | null,
  type: ErrorTypes,
  args?: unknown[]
): any[] {
  if (isArray(fn)) {
    const values: any[] = []
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args))
    }
    return values
  }

  const res = callWithErrorHandling(fn, instance, type, args)
  if (res && isPromise(res)) {
    res.catch((err: Error) => {
      handleError(err, instance, type)
    })
  }
  return res
}

export function handleError(err: Error, instance: Instance | null, type: ErrorTypes) {
  if (instance) {
    // app-level handling
    // TODO: appErrorHandler
    // const appErrorHandler = instance.appContext.config.errorHandler
  }
  error(err, instance, type)
}

export function error(err: Error, instance?: Instance | null, type?: ErrorTypes) {
  if (type) {
    warn(`未处理的错误 ${type}`, instance)
  }
  err.message = `[core]: ${err.message}`
  if (instance) {
    err.message += ` | instance: ${instance.is}`
  }
  if (__TEST__) {
    console.error(err.message)
  } else {
    throw err
  }
}

export function warn(msg: string, instance?: Instance | null) {
  // avoid props formatting or warn handler tracking deps that might be mutated
  // during patch, leading to infinite recursion.
  pauseTracking()

  let message = `[core]: ${msg}`
  if (instance) {
    message += ` | instance: ${instance.is}`
  }
  console.warn(message)

  resetTracking()
}
