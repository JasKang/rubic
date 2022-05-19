import type { AppCustomContext, Instance } from './instance'
import { createCore, setCurrentInstance } from './instance'
import { wrapLifetimeHooks } from './lifetimes'
import { APP_LIFETIMES, CORE_KEY } from './constants'
import { registerPlugins, type Plugin } from './plugin'

export type AppOptions = {
  plugins?: Plugin[]
  setup: () => Record<string, any> | void
}

const app: Record<string, any> = {}

export function useApp<T = any>() {
  return app as AppCustomContext & T
}

export function createApp(options: AppOptions) {
  const { setup, plugins = [] } = options

  registerPlugins(plugins)

  const lifetimes = wrapLifetimeHooks(APP_LIFETIMES, null)

  const core = createCore(app).initHooks('App')

  Object.assign(app, { [CORE_KEY]: core, ...lifetimes })

  setCurrentInstance(app as unknown as Instance)
  core.bindings =
    core.scope.run(() => {
      return setup()
    }) || {}
  setCurrentInstance(null)

  Object.assign(app, { ...core.bindings })

  App(app)

  return app
}
