import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { InjectionKey, Ref } from '../src'
import { provide, inject, ref, nextTick, readonly, reactive } from '../src'
import { mockConsole, resetConsole } from './mock'

// Reference: https://vue-composition-api-rfc.netlify.com/api.html#provide-inject
beforeAll(() => {
  mockConsole()
})
afterAll(() => {
  resetConsole()
})
describe('provide/inject', () => {
  test('string keys', () => {
    provide('foo', 1)
    const foo = inject('foo')
    expect(foo).toBe(1)
  })

  test('symbol keys', () => {
    // Also verifies InjectionKey type sync
    const key: InjectionKey<number> = Symbol('key')
    provide(key, 1)
    const foo = inject(key) || 1
    expect(foo + 1).toBe(2)
  })

  test('default values', () => {
    provide('foo', 'foo')
    // Default value should be ignored if value is provided
    const foo = inject('foo', 'fooDefault')
    // Default value should be used if value is not provided
    const bar = inject('bar', 'bar')
    expect(foo + bar).toBe('foobar')
  })

  test('default values with factory function', () => {
    provide('foo', 'foo')
    // Default value should be ignored if value is provided
    const foo = inject('foo', () => 'fooDefault', true)
    // Default value should be used if value is not provided
    const bar = inject('bar', () => 'bar', true)
    expect(foo + bar).toBe('foobar')
  })

  test('override providers', () => {
    provide('foo', 'foo')
    provide('bar', 'bar')

    // Override value
    provide('foo', 'fooOverride')
    provide('baz', 'baz')

    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz')

    expect([foo, bar, baz].join(',')).toBe('fooOverride,bar,baz')
  })

  test('reactivity with refs', async () => {
    const count = ref(1)
    provide('count', count)

    const injectedCount = inject<Ref<number>>('count')!
    expect(injectedCount.value).toBe(1)

    count.value++
    await nextTick()
    expect(injectedCount.value).toBe(2)
  })

  test('reactivity with readonly refs', async () => {
    const count = ref(1)
    provide('count', readonly(count))

    const injectedCount = inject<Ref<number>>('count')!
    // Should not work
    injectedCount.value++
    expect(injectedCount.value).toBe(1)

    expect(console.warn).toHaveBeenLastCalledWith(
      `[Vue warn] Set operation on key "value" failed: target is readonly.`,
      {
        __v_isRef: true,
        __v_isShallow: false,
        _rawValue: 1,
        _value: 1,
      }
    )
    // Source mutation should still work
    count.value++
    await nextTick()
    expect(injectedCount.value).toBe(2)
  })

  test('reactivity with objects', async () => {
    const rootState = reactive({ count: 1 })
    provide('state', rootState)

    const state = inject<typeof rootState>('state')!
    expect(state.count).toBe(1)

    rootState.count++
    await nextTick()
    expect(state.count).toBe(2)
  })

  test('reactivity with readonly objects', async () => {
    const rootState = reactive({ count: 1 })
    provide('state', readonly(rootState))

    const state = inject<typeof rootState>('state')!
    // Should not work
    state.count++
    expect(state.count).toBe(1)
    expect(console.warn).toHaveBeenLastCalledWith(
      `[Vue warn] Set operation on key "count" failed: target is readonly.`,
      { count: 1 }
    )
    rootState.count++
    await nextTick()
    expect(state.count).toBe(2)
  })

  test('should warn unfound', () => {
    const foo = inject(Symbol('foo'))
    expect(foo).toBeUndefined()

    expect(console.warn).toHaveBeenLastCalledWith(`[core]: injection "Symbol(foo)" not found.`)
  })

  test('should not warn when default value is undefined', () => {
    // expect(warn).not.toBeCalledTimes(1)
    inject(Symbol('foo'), undefined)
    // expect(warn).not.toBeCalledTimes(1)
  })
})
