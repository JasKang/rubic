import { readonly } from '@vue/reactivity'
import type { AppCustomContext, Instance } from './instance'
import { createCore, setCurrentInstance } from './instance'
import { wrapLifetimeHooks } from './lifetimes'
import { APP_LIFETIMES, CORE_KEY } from './constants'

export type AppOptions = Partial<WechatMiniprogram.App.Option> & {
  setup: () => Record<string, any> | void
  [key: string]: any
}

const app: Record<string, any> = {
  context: {},
}

export function getAppContext(): AppCustomContext {
  return readonly(app.context)
}

export function createApp(options: AppOptions) {
  const { setup, ...others } = options
  Object.assign(app, others)

  const lifetimes = wrapLifetimeHooks(APP_LIFETIMES, null, others)

  const core = createCore(app).initHooks('App')
  app[CORE_KEY] = core
  setCurrentInstance(app as unknown as Instance)
  const bindings =
    core.scope.run(() => {
      return setup()
    }) || {}

  core.bindings = bindings
  app.context = bindings.context || {}
  setCurrentInstance(null)

  return App({
    [CORE_KEY]: core,
    ...bindings,
    ...lifetimes,
  })
}
