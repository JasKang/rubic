import { describe, expect, test } from 'vitest'
import { loadMiddlewares } from '../src/middleware'

const middlewareArray: string[] = []

const middlewares = [
  // @ts-ignore
  (props, ctx, next) => {
    middlewareArray.push('a start')
    const nextRet = next ? next() : {}
    middlewareArray.push('a end')
    return { ...nextRet, a: 'a' }
  },
  // @ts-ignore
  (props, ctx, next) => {
    middlewareArray.push('b start')
    const nextRet = next ? next() : {}
    middlewareArray.push('b end')
    return { ...nextRet, b: 'b' }
  },
  // @ts-ignore
  (props, ctx) => {
    middlewareArray.push('c start')
    middlewareArray.push('c end')
    return { c: 'c' }
  },
  // @ts-ignore
  (props, ctx) => {
    middlewareArray.push('d start')
    middlewareArray.push('d end')
    return { d: 'd' }
  },
]

defineConfig({
  pageMiddlewares: middlewares,
  componentMiddlewares: middlewares,
})

describe('middleware', () => {
  test('string keys', () => {
    const { setup: pageSetup } = loadMiddlewares(
      {
        setup() {
          middlewareArray.push('page')
          return {}
        },
      },
      'Page'
    )
    const pageBinding = pageSetup({}, {})

    expect(pageBinding).toEqual({ c: 'c', d: 'd', b: 'b', a: 'a' })
    expect(middlewareArray).toEqual([
      'a start',
      'b start',
      'c start',
      'c end',
      'd start',
      'd end',
      'page',
      'b end',
      'a end',
    ])

    const { setup: componentSetup } = loadMiddlewares(
      {
        setup() {
          middlewareArray.push('Component')
        },
      },
      'Component'
    )
    const componentBinding = componentSetup({}, {})

    expect(componentBinding).toEqual({ c: 'c', d: 'd', b: 'b', a: 'a' })
  })
})
