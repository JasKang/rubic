# 响应性

## 声明响应式状态

我们可以使用 `reactive()` 方法创建一个响应式对象：

```ts
import { reactive } from 'rubic'

const state = reactive({ count: 0 })
```

响应式对象其实是 [JavaScript Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，行为表现与一般对象并无二致。不同之处在于 Vue 能够跟踪对响应式对象属性的访问与更改操作。如果你对这其中的细节感到好奇，我们在 深入响应式系统 一章中会进行解释，但我们推荐你先读完这里的主要指引。

要在 wxml 中使用响应式数据，请在 setup() 函数中定义并返回。

```ts
import { defineComponent, reactive } from 'rubic'

export default {
  // `setup` 是一个专门用于组合式 API 的特殊钩子
  setup() {
    const state = reactive({ count: 0 })

    // 暴露 state 到模板
    return {
      state,
    }
  },
}
```

```xml
<div>{{ state.count }}</div>
```

## ref() 定义响应式变量
