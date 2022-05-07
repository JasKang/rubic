import { config } from './config'

type Query = Record<string, string | number | boolean>

type URL = {
  app?: string
  path: string
  query?: Query
}

type URLRoute = {
  url: string
}

type NamedRoute = {
  name: string
}

type ExtraOptions = {
  app?: string
  query?: Query
  embed?: boolean
  type?: string
  events?: Record<string, (data: any) => void>
}

type RouteOptions = (URLRoute | NamedRoute) & ExtraOptions

export type RouterConfig = {
  pathPrefix?: string
  historyCapacity?: number
  isTab: (path: string) => boolean
  appMapping: Record<string, string | { appId: string; embed?: boolean }>
  getNamedURL?: (name: string) => Promise<string | URL | undefined>
  beforeChange?: (from: URL, to: URL) => boolean
}

const PATH_REGEX = /^(\/)+[a-zA-Z0-9\\-_/ ]*$/

function isNamedRoute(o: any): o is NamedRoute {
  return !!o.name
}

function isURLRoute(o: any): o is URLRoute {
  return !!o.url
}

class Router {
  private history: URL[] = []

  public go(routeOpts: string | RouteOptions, extraOpts?: ExtraOptions): Promise<any> {
    return this._makeOption(routeOpts, extraOpts).then(options => {
      return this._go(options)
    })
  }

  public redirect(routeOpts: string | RouteOptions, extraOpts?: ExtraOptions): Promise<any> {
    return this._makeOption(routeOpts, extraOpts).then(options => {
      return this._go({ ...options, type: 'redirect' })
    })
  }

  public relaunch(routeOpts: string | RouteOptions, extraOpts?: ExtraOptions): Promise<any> {
    return this._makeOption(routeOpts, extraOpts).then(options => {
      return this._go({ ...options, type: 'relaunch' })
    })
  }

  private _nameToURL(name: string): Promise<URL> {
    const { getNamedURL } = getRouterConfig()
    if (!getNamedURL) {
      throw new Error('未配置获取命名路径方法')
    }
    return getNamedURL(name).then(namedURL => {
      if (!namedURL) {
        throw new Error(`未找到${name}对应的URL`)
      }
      let url
      if (typeof namedURL === 'string') {
        url = parseURL(namedURL)
      } else {
        url = namedURL
      }
      url.query = url.query || {}
      return url
    })
  }

  private _makeOption(routeOpts: string | RouteOptions, extraOpts?: ExtraOptions): Promise<URL & ExtraOptions> {
    const future = new Promise((resolve, reject) => {
      if (typeof routeOpts === 'string') {
        if (routeOpts.indexOf('/') >= 0) {
          const url = parseURL(routeOpts)
          resolve({ url, extraOpts: extraOpts || {} })
        } else {
          this._nameToURL(routeOpts)
            .then(url => {
              resolve({ url, extraOpts: extraOpts || {} })
            })
            .catch(err => reject(err))
        }
      } else if (isNamedRoute(routeOpts)) {
        const { name, ...otherOpts } = routeOpts
        this._nameToURL(name)
          .then(url => {
            resolve({ url, extraOpts: otherOpts })
          })
          .catch(err => reject(err))
        extraOpts = otherOpts
      } else if (isURLRoute(routeOpts)) {
        const { url: urlStr, ...otherOpts } = routeOpts
        const url = parseURL(urlStr)
        resolve({ url, extraOpts: otherOpts })
      } else {
        reject(new Error('invalid options'))
      }
    })

    return future.then(({ url, extraOpts }: any) => {
      if (url.app && extraOpts.app && url.app !== extraOpts.app) {
        throw new Error('url中已有app')
      }
      if (!url.path) {
        throw new Error('path is required')
      }
      if (!PATH_REGEX.test(url.path)) {
        throw new Error('path is invalid')
      }
      const { query = {}, ...opts } = extraOpts
      Object.assign(url.query, query)
      return { ...url, ...opts }
    })
  }

  private _go(options: URL & ExtraOptions): Promise<any> {
    const rc = getRouterConfig()
    const { events, type, embed, ...u } = options
    return new Promise((resolve, reject) => {
      const { historyCapacity = 10 } = rc
      if (this.history.length >= historyCapacity) {
        this.history.pop()
      }
      this.history.push(u)
      const [to, from] = this.history
      if (rc.beforeChange && !rc.beforeChange(to, from)) {
        return
      }
      const url = pathWithQuery(u)
      if (u.app) {
        let appConfig = rc.appMapping[u.app]
        if (typeof appConfig === 'string') {
          appConfig = { appId: appConfig }
        }
        if (wx.canIUse('openEmbeddedMiniProgram') && (appConfig.embed || embed)) {
          // @ts-ignore 新API，等types文件更新
          wx.openEmbeddedMiniProgram({
            appId: appConfig.appId,
            path: url,
          })
            .then(resolve)
            .catch(reject)
          return
        }
        wx.navigateToMiniProgram({
          appId: appConfig.appId,
          path: url,
        })
          .then(resolve)
          .catch(reject)
        return
      }
      if (rc.isTab(u.path)) {
        wx.switchTab({ url }).then(resolve).catch(reject)
        return
      }
      if (type === 'redirect') {
        wx.redirectTo({ url }).then(resolve).catch(reject)
        return
      }
      if (type === 'relaunch') {
        wx.reLaunch({ url }).then(resolve).catch(reject)
        return
      }
      wx.navigateTo({ url, events }).then(resolve).catch(reject)
    })
  }

  public back(delta: number) {
    for (let i = 0; i < delta; i++) {
      this.history.pop()
    }
    return wx.navigateBack({ delta })
  }
}

export const router = new Router()

const defaultRouterConfig = {
  historyCapacity: 10,
  pathPrefix: '/',
  isTab: () => false,
  appMapping: {},
}
function getRouterConfig(): RouterConfig {
  return config.get('router') || defaultRouterConfig
}

// app:/path?query
function parseURL(str: string): URL {
  let app
  let qs
  let parts = str.split(':')
  if (parts.length > 2) {
    throw new Error('url is invalid')
  }
  if (parts.length === 2) {
    app = parts[0]
    str = parts[1]
  } else {
    str = parts[0]
  }
  parts = str.split('?')
  if (parts.length > 2) {
    throw new Error('url is invalid')
  }
  const path = parts[0]
  if (!PATH_REGEX.test(path)) {
    throw new Error('url is invalid')
  }
  if (parts.length === 2) {
    qs = parts[1]
  }
  let query = {}
  if (qs) {
    query = parseQuery(qs)
  }
  return { app, path, query }
}

function parseQuery(qs: string): Query {
  const query: Query = {}
  const pairs = (qs[0] === '?' ? qs.substring(1) : qs).split('&')
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=')
    const key = decodeURIComponent(pair[0])
    const value = decodeURIComponent(pair[1] || '')
    query[key] = value
  }
  return query
}

function stringifyQuery(q: Query): string {
  const str: string[] = []
  for (const p in q) {
    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(q[p]))
  }
  return str.join('&')
}

function pathWithQuery(u: URL) {
  let str = u.path
  if (u.query && Object.keys(u.query).length > 0) {
    str += `?${stringifyQuery(u.query)}`
  }
  return str
}
