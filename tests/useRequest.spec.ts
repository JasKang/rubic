import { describe, expect, test } from 'vitest'
import { useRequestV2, defineComponent } from '../src'
import { renderComponent, sleep } from './mock'

let options: any = null
useRequestV2.defineConfig({
  fetcher: ({ type, data, path, options: opts }) => {
    options = opts
    return new Promise((resolve, reject) => {
      return setTimeout(() => {
        if (type === '') {
          reject({ code: 409 })
        } else {
          resolve({ code: 200 })
        }
      }, 100)
    })
  },
})
describe('useRequest ', () => {
  test('base', async () => {
    let result: any = {}
    await renderComponent(() =>
      defineComponent({
        setup() {
          result = useRequestV2({
            type: 'type',
            path: 'path',
            data: {},
          })
        },
      })
    )
    expect(result.loading.value).toBe(true)
    expect(result.error.value).toBe(null)
    expect(result.data.value).toBe(null)
    await sleep(150)
    expect(result.loading.value).toBe(false)
    expect(result.error.value).toBe(null)
    expect(result.data.value).toEqual({ code: 200 })
  })
  test('error', async () => {
    let result: any = {}
    await renderComponent(() =>
      defineComponent({
        setup() {
          result = useRequestV2({
            type: '',
            path: 'path',
            data: {},
          })
        },
      })
    )
    expect(result.loading.value).toBe(true)
    expect(result.error.value).toBe(null)
    expect(result.data.value).toBe(null)
    await sleep(150)
    expect(result.loading.value).toBe(false)
    expect(result.error.value).toEqual({ code: 409 })
    expect(result.data.value).toEqual(null)
  })
  test('options', async () => {
    await renderComponent(() =>
      defineComponent({
        setup() {
          useRequestV2({
            type: 'type',
            path: 'path',
            data: {},
            options: { key1: 'key1' },
          })
        },
      })
    )
    expect(options).toEqual({ key1: 'key1' })
  })

  test('options merge', async () => {
    await renderComponent(() =>
      defineComponent({
        setup() {
          useRequestV2(
            {
              type: 'type',
              path: 'path',
              data: {},
              options: { key1: 'key1', key2: 'key2', key3: 'key3' },
            },
            {
              key2: 'key2-2',
              key3: 'key3-2',
            }
          )
        },
      })
    )

    expect(options).toEqual({ key1: 'key1', key2: 'key2-2', key3: 'key3-2' })
  })
})
