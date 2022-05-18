import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import {
  CORE_KEY,
  type DebuggerEvent,
  type Instance,
  ITERATE_KEY,
  watchSyncEffect,
  watchPostEffect,
  reactive,
  computed,
  nextTick,
  ref,
  defineComponent,
  shallowRef,
  triggerRef,
  watchEffect,
  watch,
  getCurrentInstance,
} from '../src'
import { mockConsole, renderComponent, resetConsole, sleep } from './mock'

beforeAll(() => {
  mockConsole()
})
afterAll(() => {
  resetConsole()
})

// reference: https://vue-composition-api-rfc.netlify.com/api.html#watch

describe('api: watch', () => {
  test('effect', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(dummy).toBe(1)
  })

  test('watching single source: getter', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watch(
      () => state.count,
      (count, prevCount) => {
        dummy = [count, prevCount]
        // assert types
        count + 1
        if (prevCount) {
          prevCount + 1
        }
      }
    )
    state.count++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  test('watching single source: ref', async () => {
    const count = ref(0)
    let dummy
    watch(count, (count, prevCount) => {
      dummy = [count, prevCount]
      // assert types
      count + 1
      if (prevCount) {
        prevCount + 1
      }
    })
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  test('watching single source: array', async () => {
    const array = reactive([] as number[])
    const spy = vi.fn()
    watch(array, spy)
    array.push(1)
    await nextTick()
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith([1], expect.anything(), expect.anything())
  })

  test('should not fire if watched getter result did not change', async () => {
    const spy = vi.fn()
    const n = ref(0)
    watch(() => n.value % 2, spy)

    n.value++
    await nextTick()
    expect(spy).toBeCalledTimes(1)

    n.value += 2
    await nextTick()
    // should not be called again because getter result did not change
    expect(spy).toBeCalledTimes(1)
  })

  test('watching single source: computed ref', async () => {
    const count = ref(0)
    const plus = computed(() => count.value + 1)
    let dummy
    watch(plus, (count, prevCount) => {
      dummy = [count, prevCount]
      // assert types
      count + 1
      if (prevCount) {
        prevCount + 1
      }
    })
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([2, 1])
  })

  test('watching primitive with deep: true', async () => {
    const count = ref(0)
    let dummy
    watch(
      count,
      (c, prevCount) => {
        dummy = [c, prevCount]
      },
      {
        deep: true,
      }
    )
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  test('directly watching reactive object (with automatic deep: true)', async () => {
    const src = reactive({
      count: 0,
    })
    let dummy
    watch(src, ({ count }) => {
      dummy = count
    })
    src.count++
    await nextTick()
    expect(dummy).toBe(1)
  })

  test('watching multiple sources', async () => {
    const state = reactive({ count: 1 })
    const count = ref(1)
    const plus = computed(() => count.value + 1)

    let dummy
    watch([() => state.count, count, plus], (vals, oldVals) => {
      dummy = [vals, oldVals]
      // assert types
      vals.concat(1)
      oldVals.concat(1)
    })

    state.count++
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([
      [2, 2, 3],
      [1, 1, 2],
    ])
  })

  test('watching multiple sources: readonly array', async () => {
    const state = reactive({ count: 1 })
    const status = ref(false)

    let dummy
    watch([() => state.count, status] as const, (vals, oldVals) => {
      dummy = [vals, oldVals]
      const [count] = vals
      const [, oldStatus] = oldVals
      // assert types
      count + 1
      oldStatus === true
    })

    state.count++
    status.value = true
    await nextTick()
    expect(dummy).toMatchObject([
      [2, true],
      [1, false],
    ])
  })

  test('watching multiple sources: reactive object (with automatic deep: true)', async () => {
    const src = reactive({ count: 0 })
    let dummy
    watch([src], ([state]) => {
      dummy = state
      // assert types
      state.count === 1
    })
    src.count++
    await nextTick()
    expect(dummy).toMatchObject({ count: 1 })
  })

  test('warn invalid watch source', () => {
    // @ts-ignore
    watch(1, () => {})
    expect(console.warn).toHaveBeenLastCalledWith(
      `[core]: Invalid watch source: 1A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`
    )
  })

  test('warn invalid watch source: multiple sources', () => {
    watch([1], () => {})
    expect(console.warn).toHaveBeenLastCalledWith(
      `[core]: Invalid watch source: 1A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`
    )
  })

  test('stopping the watcher (effect)', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const stop = watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    stop()
    state.count++
    await nextTick()
    // should not update
    expect(dummy).toBe(0)
  })

  test('stopping the watcher (with source)', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const stop = watch(
      () => state.count,
      count => {
        dummy = count
      }
    )

    state.count++
    await nextTick()
    expect(dummy).toBe(1)

    stop()
    state.count++
    await nextTick()
    // should not update
    expect(dummy).toBe(1)
  })

  test('cleanup registration (effect)', async () => {
    const state = reactive({ count: 0 })
    const cleanup = vi.fn()
    let dummy
    const stop = watchEffect(onCleanup => {
      onCleanup(cleanup)
      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  test('cleanup registration (with source)', async () => {
    const count = ref(0)
    const cleanup = vi.fn()
    let dummy
    const stop = watch(count, (count, prevCount, onCleanup) => {
      onCleanup(cleanup)
      dummy = count
    })

    count.value++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(0)
    expect(dummy).toBe(1)

    count.value++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(2)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  test('flush timing: pre (default)', async () => {
    const count = ref(0)
    const count2 = ref(0)

    const assertion = vi.fn((countVal, count2Val) => {})

    const Comp = await renderComponent(
      {
        template: '<div>{{count}}</div>',
      },
      () =>
        defineComponent({
          setup() {
            watchEffect(() => {
              assertion(count.value, count2.value)
            })
            return { count: count }
          },
        })
    )
    await sleep(10)
    expect(assertion).toHaveBeenCalledTimes(1)
    expect(count.value).toBe(0)
    expect(count2.value).toBe(0)
    expect(Comp.dom?.innerHTML).toBe(`<div>${count.value}</div>`)

    count.value++
    count2.value++
    await nextTick()
    // two mutations should result in 1 callback execution
    expect(count.value).toBe(1)
    expect(count2.value).toBe(1)
    expect(assertion).toHaveBeenCalledTimes(2)
    await sleep(10)
    expect(Comp.dom?.innerHTML).toBe(`<div>${count.value}</div>`)
  })

  test('flush timing: post', async () => {
    const count = ref(0)
    let callCount = 0
    const assertion = vi.fn(count => {
      callCount++
    })

    const Comp = await renderComponent(
      {
        template: '{{count}}',
      },
      () =>
        defineComponent({
          setup() {
            watchEffect(
              () => {
                assertion(count.value)
              },
              { flush: 'post' }
            )
            return { count }
          },
        })
    )

    expect(count.value).toBe(0)
    expect(callCount).toBe(1)

    count.value++
    expect(count.value).toBe(1)
    expect(callCount).toBe(1)
    await nextTick()
    expect(callCount).toBe(2)
  })

  test('watchPostEffect', async () => {
    const count = ref(0)

    const assertion = vi.fn(count => {})

    const Comp = await renderComponent(() =>
      defineComponent({
        setup() {
          watchPostEffect(() => {
            assertion(count.value)
          })
          return () => count.value
        },
      })
    )
    expect(assertion).toHaveBeenCalledTimes(1)
    expect(count.value).toBe(0)

    count.value++
    expect(count.value).toBe(1)
    expect(assertion).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(2)
  })

  test('flush timing: sync', async () => {
    const count = ref(0)
    const count2 = ref(0)

    const assertion = vi.fn((count, count2) => {})

    const Comp = await renderComponent(() =>
      defineComponent({
        setup() {
          watchEffect(
            () => {
              assertion(count.value, count2.value)
            },
            {
              flush: 'sync',
            }
          )
          return () => count.value
        },
      })
    )
    expect(assertion).toHaveBeenCalledTimes(1)
    expect(count.value).toBe(0)
    expect(count2.value).toBe(0)

    count.value++
    expect(assertion).toHaveBeenCalledTimes(2)
    count2.value++
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(3)
    expect(count.value).toBe(1)
    expect(count2.value).toBe(1)
  })

  test('watchSyncEffect', async () => {
    const count = ref(0)
    const count2 = ref(0)

    const assertion = vi.fn((count, count2) => {})

    const Comp = await renderComponent(() =>
      defineComponent({
        setup() {
          watchSyncEffect(() => {
            assertion(count.value, count2.value)
          })
          return () => count.value
        },
      })
    )
    expect(assertion).toHaveBeenCalledTimes(1)
    expect(count.value).toBe(0)
    expect(count2.value).toBe(0)

    count.value++
    expect(assertion).toHaveBeenCalledTimes(2)
    count2.value++
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(3)
    expect(count.value).toBe(1)
    expect(count2.value).toBe(1)
  })

  test('deep', async () => {
    const state = reactive({
      nested: {
        count: ref(0),
      },
      array: [1, 2, 3],
      map: new Map([
        ['a', 1],
        ['b', 2],
      ]),
      set: new Set([1, 2, 3]),
    })

    let dummy
    watch(
      () => state,
      state => {
        dummy = [state.nested.count, state.array[0], state.map.get('a'), state.set.has(1)]
      },
      { deep: true }
    )

    state.nested.count++
    await nextTick()
    expect(dummy).toEqual([1, 1, 1, true])

    // nested array mutation
    state.array[0] = 2
    await nextTick()
    expect(dummy).toEqual([1, 2, 1, true])

    // nested map mutation
    state.map.set('a', 2)
    await nextTick()
    expect(dummy).toEqual([1, 2, 2, true])

    // nested set mutation
    state.set.delete(1)
    await nextTick()
    expect(dummy).toEqual([1, 2, 2, false])
  })

  test('watching deep ref', async () => {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    const state = reactive([count, double])

    let dummy
    watch(
      () => state,
      state => {
        dummy = [state[0].value, state[1].value]
      },
      { deep: true }
    )

    count.value++
    await nextTick()
    expect(dummy).toEqual([1, 2])
  })

  test('immediate', async () => {
    const count = ref(0)
    const cb = vi.fn()
    watch(count, cb, { immediate: true })
    expect(cb).toHaveBeenCalledTimes(1)
    count.value++
    await nextTick()
    expect(cb).toHaveBeenCalledTimes(2)
  })

  test('immediate: triggers when initial value is null', async () => {
    const state = ref(null)
    const spy = vi.fn()
    watch(() => state.value, spy, { immediate: true })
    expect(spy).toHaveBeenCalled()
  })

  test('immediate: triggers when initial value is undefined', async () => {
    const state = ref()
    const spy = vi.fn()
    watch(() => state.value, spy, { immediate: true })
    expect(spy).toHaveBeenCalled()
    state.value = 3
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(2)
    // testing if undefined can trigger the watcher
    state.value = undefined
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(3)
    // it shouldn't trigger if the same value is set
    state.value = undefined
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(3)
  })

  test('warn immediate option when using effect', async () => {
    const count = ref(0)
    let dummy
    watchEffect(
      () => {
        dummy = count.value
      },
      // @ts-ignore
      { immediate: false }
    )
    expect(dummy).toBe(0)
    expect(console.warn).toHaveBeenLastCalledWith(
      `[core]: watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`
    )

    count.value++
    await nextTick()
    expect(dummy).toBe(1)
  })

  test('warn and not respect deep option when using effect', async () => {
    const arr = ref([1, [2]])
    const spy = vi.fn()
    watchEffect(
      () => {
        spy()
        return arr
      },
      // @ts-ignore
      { deep: true }
    )
    expect(spy).toHaveBeenCalledTimes(1)
    ;(arr.value[1] as Array<number>)[0] = 3
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(console.warn).toHaveBeenLastCalledWith(
      `[core]: watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`
    )
  })

  test('onTrack', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrack = vi.fn((e: DebuggerEvent) => {
      const { effect, ...others } = e
      // @ts-expect-error
      events.push(others)
    })
    const obj = reactive({ foo: 1, bar: 2 })
    watchEffect(
      () => {
        dummy = [obj.foo, 'bar' in obj, Object.keys(obj)]
      },
      { onTrack }
    )
    await nextTick()
    expect(dummy).toEqual([1, true, ['foo', 'bar']])
    expect(onTrack).toHaveBeenCalledTimes(3)

    expect(events).toMatchObject([
      {
        target: obj,
        type: 'get',
        key: 'foo',
      },
      {
        target: obj,
        type: 'has',
        key: 'bar',
      },
      {
        target: obj,
        type: 'iterate',
        key: ITERATE_KEY,
      },
    ])
  })

  test('onTrigger', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrigger = vi.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1 })
    watchEffect(
      () => {
        dummy = obj.foo
      },
      { onTrigger }
    )
    await nextTick()
    expect(dummy).toBe(1)

    obj.foo++
    await nextTick()
    expect(dummy).toBe(2)
    expect(onTrigger).toHaveBeenCalledTimes(1)
    expect(events[0]).toMatchObject({
      type: 'set',
      key: 'foo',
      oldValue: 1,
      newValue: 2,
    })

    // @ts-ignore
    delete obj.foo
    await nextTick()
    expect(dummy).toBeUndefined()
    expect(onTrigger).toHaveBeenCalledTimes(2)
    expect(events[1]).toMatchObject({
      type: 'delete',
      key: 'foo',
      oldValue: 2,
    })
  })

  test('should work sync', () => {
    const v = ref(1)
    let calls = 0

    watch(
      v,
      () => {
        ++calls
      },
      {
        flush: 'sync',
      }
    )

    expect(calls).toBe(0)
    v.value++
    expect(calls).toBe(1)
  })

  test('should force trigger on triggerRef when watching a shallow ref', async () => {
    const v = shallowRef({ a: 1 })
    let sideEffect = 0
    watch(v, obj => {
      sideEffect = obj.a
    })

    v.value = v.value
    await nextTick()
    // should not trigger
    expect(sideEffect).toBe(0)

    v.value.a++
    await nextTick()
    // should not trigger
    expect(sideEffect).toBe(0)

    triggerRef(v)
    await nextTick()
    // should trigger now
    expect(sideEffect).toBe(2)
  })

  // #2125
  test('watchEffect should not recursively trigger itself', async () => {
    const spy = vi.fn()
    const price = ref(10)
    const history = ref<number[]>([])
    watchEffect(() => {
      history.value.push(price.value)
      spy()
    })
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  // #2231
  test('computed refs should not trigger watch if value has no change', async () => {
    const spy = vi.fn()
    const source = ref(0)
    const price = computed(() => source.value === 0)
    watch(price, spy)
    source.value++
    await nextTick()
    source.value++
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('watching sources: ref<any[]>', async () => {
    const foo = ref([1])
    const spy = vi.fn()
    watch(foo, () => {
      spy()
    })
    foo.value = foo.value.slice()
    await nextTick()
    expect(spy).toBeCalledTimes(1)
  })

  test('watching multiple sources: computed', async () => {
    let count = 0
    const value = ref('1')
    const plus = computed(() => !!value.value)
    watch([plus], () => {
      count++
    })
    value.value = '2'
    await nextTick()
    expect(plus.value).toBe(true)
    expect(count).toBe(0)
  })

  // #4158
  test('watch should not register in owner component if created inside detached scope', async () => {
    let instance: Instance
    const comp = await renderComponent(() =>
      defineComponent({
        setup() {
          instance = getCurrentInstance()!
          watch(
            () => 1,
            () => {}
          )
          return {}
        },
      })
    )
    // should not record watcher in detached scope and only the instance's
    // own update effect
    expect(instance![CORE_KEY].scope.effects.length).toBe(2)
  })
})
