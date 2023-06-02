# 状态管理

状态管理 API 允许您跨组件/页面共享状态。

`Rubic` 中的 Store 使用方法与 `pinia` 保持一致，在 `pinia` 的基础上移除了 options API，仅保留了最基础的那里。

## 什么是 Store

每一个 Store 都是一个实体，它持有未绑定到您的组件树的状态和业务逻辑。 换句话说，它托管全局状态，有点像一个始终存在并且每个人都可以读取和写入的数据存储。

另一方面，并非所有页面或组件都需要访问全局状态，开发者应该避免在 Store 中包含组件中的本身的状态数据，例如组件本地元素的可见性。

## 定义一个 Store

`Store` 是使用 `defineStore()` 函数定义的，并且它需要一个唯一名称，作为第一个参数传递：

```ts
import { defineStore } from 'rubic'

// useStore 可以是 useUser、useCart 之类的任何东西
// 第一个参数是应用程序中 store 的唯一 id
export const useStore = defineStore('main', {
  // other options...
})
```

这个 `name`，也称为 `id`，是必要的。 将返回的函数命名为 `use...` 这是通用的约定。

```ts
// pages/xxx/stores/counter.js

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  return { count, doubleCount, increment }
})
```

## 使用 Store

在 `setup()` 中调用 `useStore()` 来使用 `store`：

```ts
// pages/xxx
import { useCounterStore } from './stores/counter'

defineComponent({
  setup() {
    const store = useCounterStore()

    return {
      // 您可以返回整个 store 实例以在模板中使用它
      store,
    }
  },
})
```

请注意，`store` 是一个用 `reactive` 包裹的对象，这意味着不需要在 `getter` 之后写 .value，但是，就像 `setup` 中的 `props` 一样，我们不能对其进行解构：

```ts
import { defineComponent, storeToRefs } from 'rubic'
import { useCounterStore } from './stores/counter'

defineComponent({
  setup() {
    const store = useCounterStore()
    // ❌ 这行不通，因为它破坏了响应式，这和从 “props” 中解构是一样的
    const { count, doubleCount } = store

    return {
      store,
      count,
      doubleCount,
      increment: store.increment,
    }
  },
})
```

为了从 `Store` 中提取属性同时保持其响应式，您需要使用 `storeToRefs()`。 它将为任何响应式属性创建 `refs`。 当您仅使用 `store` 中的状态但不调用任何操作时，这很有用：

```ts
import { defineComponent, storeToRefs } from 'rubic'
import { useCounterStore } from './stores/counter'

defineComponent({
  setup() {
    const store = useCounterStore()
    // ✅ ' name '和' doubleCount '是响应式 ref
    // 但跳过任何 action 或 非响应式（不是 ref/reactive）的属性
    const { count, doubleCount } = storeToRefs(store)

    return {
      store,
      count,
      doubleCount,
      increment: store.increment,
    }
  },
})
```

## 修改状态

`useStore` 函数返回的数据为只读状态，开发者只允许通过函数去修改这些值。 这样做是因为允许任意修改会导致 `store` 的变化难以被追溯。

```ts
import { defineComponent, storeToRefs } from 'rubic'
import { useCounterStore } from './stores/counter'

defineComponent({
  setup() {
    const store = useCounterStore()
    // ❌ 这行不通，因为 “store.count” 为 readonly
    store.count = store.count + 1
    // ✅ 能通过 store 导出的函数来进行状态变更
    store.increment()
  },
})
```

另一个方式是 `$patch` 函数

```ts
import { defineComponent, storeToRefs } from 'rubic'
import { useCounterStore } from './stores/counter'

defineComponent({
  setup() {
    const store = useCounterStore()
    // ❌ 这行不通，因为 “store.count” 为 readonly
    store.count = store.count + 1
    // ✅ 能通过 $patch 函数来进行状态变更
    store.$patch({ count: store.count + 1 })
  },
})
```
