# 组件

## 声明组件

在组件 js 文件中使用 `defineComponent` 函数定义页面, `setup` 函数对应小程序组件 `attach` 回调

```ts
import { defineComponent } from 'rubic'

defineComponent({
  setup(props, context) {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    function increment() {
      count.value++
    }
    return {
      count,
      double,
      increment,
    }
  },
})
```

```xml
<button bindtap="increment">
  Count is: {{ count }}, double is: {{ double }}
</button>
```

## Props

`setup` 函数中的第一个参数是组件接收到的 `props`。正如在一个标准组件中所期望的那样，`setup` 函数中的 `props` 是响应式的，当传入新的 prop 时，它将被更新。

`props` 属性本质是小程序 `properties` 的语法糖包装，`type` 支持了数组，并移除了 optionalTypes 和 observer 属性。

```ts
import { defineComponent } from 'rubic'

definePage({
  props: {
    // 基础的类型检查 (`null` 和 `undefined` 值会通过任何类型验证)
    propA: Number,
    // 多个可能的类型
    propB: [String, Number],
    // 带有默认值
    propC: {
      type: String,
      value: 'c',
    },
  },
  setup(props, context) {
    console.log('propA ', props.propA)
    console.log('propB ', props.propB)
  },
})
```

`type` 属性的类型可以为 `String` `Number` `Boolean` `Object` `Array` 其一，也可以为 `null` 表示不限制类型。

::: warning
但是，因为 props 是响应式的，你不能使用 ES6 解构，它会消除 prop 的响应性。
:::

如果需要解构 prop，可以在 setup 函数中使用 toRefs 函数来完成此操作：

```ts
import { toRefs } from 'rubic'

defineComponent({
  props: {
    title: String,
  },
  setup(props) {
    const { title } = toRefs(props)

    console.log(title.value)
  },
})
```

## Context

传递给 setup 函数的第二个参数是 context。context 是当前组件实例，可以使用它来代替原生小程序中的 this：

```ts
defineComponent({
  setup(props, context) {
    // 触发事件
    console.log(context.triggerEvent)
    // 使用选择器选择组件实例节点
    console.log(context.selectComponent)
    // 创建一个 SelectorQuery 对象
    console.log(context.createSelectorQuery)
  },
})
```

context 是一个组件实例对象，它不是响应式的，这意味着你可以安全地对 context 使用 ES6 解构。

```ts
defineComponent({
  setup(props, { triggerEvent, selectComponent, createSelectorQuery }) {
    ...
  },
})
```

目前发现 context.getOpenerEventChannel 方法在 attach 阶段并没有生成。这意味着你应该避免对它进行解构使用，并始终以 context.getOpenerEventChannel 的方式调用。

## 生命周期 API

Rubic 导出了一系列组合式 API 来注册生命周期钩子。它们的命名和 Component 原始生命周期类似，加上 `on` 为前缀
即：`lifetimes.ready` -> `onReady`，

这些函数接受一个回调，该回调的参数与对应的生命周期一致，当钩子被实例调用时，该回调将被执行。
且 `onXXX` 函数大都能被多次调用，依赖返回值的将会使用最后一次的返回值。

让我们将其添加到 `setup` 函数中：

```ts
import { defineComponent, onReady, onError } from 'rubic'

defineComponent({
  setup(props, context) {
    onReady(() => {
      console.log('component ready')
    })
    onError(err => {
      console.log(err)
    })
  },
})
```

完整的 Component 生命周期组合式 API 函数如下：

```ts
import {
  // lifetimes
  onReady,
  onMoved,
  onDetached,
  onError,
  // pageLifetimes
  onShow,
  onHide,
  onResize,
} from 'rubic'
```

#### 生命周期对应关系

| 组合式 API | 原生小程序                           |
| ---------- | ------------------------------------ |
| setup      | Component -> lifetimes -> attach     |
| onReady    | Component -> lifetimes -> ready      |
| onMoved    | Component -> lifetimes -> moved      |
| onDetached | Component -> lifetimes -> detached   |
| onError    | Component -> lifetimes -> error      |
| onShow     | Component -> pageLifetimes -> show   |
| onHide     | Component -> pageLifetimes -> hide   |
| onResize   | Component -> pageLifetimes -> resize |
