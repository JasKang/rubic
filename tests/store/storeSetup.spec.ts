import { beforeEach, describe, it, expect, vi } from 'vitest'
import { computed, defineStore, nextTick, ref, watch } from '../../src'
import { resetRootStore } from '../../src/store'

function expectType<T>(_value: T): void {}

describe('store with setup syntax', () => {
  function mainFn() {
    const name = ref('Eduardo')
    const counter = ref(0)
    function increment(amount = 1) {
      counter.value += amount
    }
    const double = computed(() => counter.value * 2)

    return { name, counter, increment, double }
  }

  const useStore = defineStore('main', mainFn)

  beforeEach(() => {
    resetRootStore()
  })

  it('should extract the $state', () => {
    const store = useStore()
    expectType<{ name: string; counter: number }>(store.$state)
    expect(store.$state).toEqual({ name: 'Eduardo', double: 0, counter: 0 })
    expect(store.name).toBe('Eduardo')
    expect(store.counter).toBe(0)
    expect(store.double).toBe(0)
    store.increment()
    expect(store.counter).toBe(1)
    expect(store.double).toBe(2)
    expect(store.$state).toEqual({ name: 'Eduardo', double: 2, counter: 1 })
  })

  it('can store a function', () => {
    const store = defineStore('main', () => {
      const fn = ref(() => {})
      function action() {}
      return { fn, action }
    })()
    expectType<{ fn: () => void }>(store.$state)
    expect(store.$state).toEqual({ fn: expect.any(Function) })
    expect(store.fn).toEqual(expect.any(Function))
    store.action()
  })

  it('can directly access state at the store level', () => {
    const store = useStore()

    expect(store.name).toBe('Eduardo')
    store.name = 'Ed'
    expect(store.name).toBe('Ed')
  })

  it('state is reactive', () => {
    const store = useStore()
    const upperCased = computed(() => store.name.toUpperCase())
    expect(upperCased.value).toBe('EDUARDO')
    store.name = 'Ed'
    expect(upperCased.value).toBe('ED')
  })

  it('state can be watched', async () => {
    const store = useStore()
    const spy = vi.fn()
    watch(() => store.name, spy)
    expect(spy).not.toHaveBeenCalled()
    store.name = 'Ed'
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  // TODO: could be fixed by using computed or getters + setters in store
  it.skip('state refs can be watched', async () => {
    const store = useStore()
    const spy = vi.fn()
    watch(() => store.name, spy)
    expect(spy).not.toHaveBeenCalled()
    const nameRef = ref('Ed')
    // store._p.state.value[store.$id].name = nameRef
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('unwraps refs', () => {
    const name = ref('Eduardo')
    const counter = ref(0)
    const double = computed({
      get: () => counter.value * 2,
      set(val) {
        counter.value = val / 2
      },
    })

    const useStore = defineStore('main', () => ({
      name,
      counter,
      double,
    }))

    const store = useStore()

    expect(store.name).toBe('Eduardo')
    expect(store.$state.name).toBe('Eduardo')
    expect(store.$state).toEqual({
      name: 'Eduardo',
      counter: 0,
      double: 0,
    })

    name.value = 'Ed'
    expect(store.name).toBe('Ed')
    expect(store.$state.name).toBe('Ed')

    store.name = 'Edu'
    expect(store.name).toBe('Edu')

    store.$patch({ counter: 2 })
    expect(store.counter).toBe(2)
    expect(counter.value).toBe(2)
  })
})
