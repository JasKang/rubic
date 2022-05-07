import type { OptionsProcess, SetupProcess } from './middleware'
import type { RouterConfig } from './router'

type ShareMiddleware =
  | {
      optionsProcess?: OptionsProcess
      setupProcess?: SetupProcess
    }
  | SetupProcess

export interface AppConfig {
  pageMiddlewares: ShareMiddleware[]
  componentMiddlewares: ShareMiddleware[]
  router?: RouterConfig
}
