import { describe, expect, test } from 'vitest'
import { registerPlugins, usePlugin } from '../src/plugin'

const middlewareArray: string[] = []
registerPlugins([
  {
    name: '1',
    setup(props, ctx, next) {
      middlewareArray.push('a start')
      const nextRet = next ? next() : {}
      middlewareArray.push('a end')
      return { ...nextRet, a: 'a' }
    },
  },
  {
    name: '2',
    setup(props, ctx, next) {
      middlewareArray.push('b start')
      const nextRet = next ? next() : {}
      middlewareArray.push('b end')
      return { ...nextRet, b: 'b' }
    },
  },
  {
    name: '3',
    setup(props, ctx) {
      middlewareArray.push('c start')
      middlewareArray.push('c end')
      return { c: 'c' }
    },
  },
  {
    name: '4',
    setup(props, ctx) {
      middlewareArray.push('d start')
      middlewareArray.push('d end')
      return { d: 'd' }
    },
  },
])

describe('middleware', () => {
  test('string keys', () => {
    const { setup: pageSetup } = usePlugin(
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

    const { setup: componentSetup } = usePlugin(
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
