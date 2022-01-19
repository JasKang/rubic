# 页面

::: tip
文档中带 Tab 的代码块皆可切换查看对应代码。如果文档包含对应 wxml 代码，可以点击 tab 查看。
:::

## 声明页面

在页面 js 文件中使用 `definePage` 函数定义页面, `setup` 函数对应原生小程序 `attach` 回调

<CodeGroup>
  <CodeGroupItem title="page.js" active>

```ts
import { definePage } from 'rubic'

definePage({
  props:{
    paramA: String
    paramB: String
  },
  setup(query, context) {
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

  </CodeGroupItem>

  <CodeGroupItem title="page.wxml">

```xml
<button bindtap="increment">
  Count is: {{ count }}, double is: {{ double }}
</button>
```

  </CodeGroupItem>
</CodeGroup>

::: warning 注意：关于 setup 调用时机
为了统一 setup 执行顺序，`definePage` 底层 [使用 Component 构造器构造页面](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html#%E4%BD%BF%E7%94%A8-Component-%E6%9E%84%E9%80%A0%E5%99%A8%E6%9E%84%E9%80%A0%E9%A1%B5%E9%9D%A2)
:::

## query 参数

由于使用了 Component 构造器构造页面，使用到的页面参数需要先在 props 中定义，具体详情可查看小程序官方文档: [使用 Component 构造器构造页面](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html#%E4%BD%BF%E7%94%A8-Component-%E6%9E%84%E9%80%A0%E5%99%A8%E6%9E%84%E9%80%A0%E9%A1%B5%E9%9D%A2)

如访问： pages/test/index?paramA=123&paramB=xyz

```ts
// pages/test/index.js
import { definePage } from 'rubic'

definePage({
  props:{
    paramA:String
    paramB:String
  },
  setup(query, context) {
    console.log('paramA ',query.paramA)
    // 输出：paramA:123
    console.log('paramB ',query.paramB)
    // 输出：paramA:xyz
  },
})
```

##### 未知页面参数

如果有无法确定有哪些页面参数的情况，可以使用 onLoad 函数回调中的参数来代替

如访问： pages/test/index?paramA=123&paramB=xyz

```ts
// pages/test/index.js
import { definePage, onLoad } from 'rubic'

definePage({
  props: {},
  setup(query, context) {
    console.log('query:', query)
    // 由于未定义 props , 所以这里输出：{}

    onLoad(options => {
      // onLoad 回调中的 options 能获取到完整的页面参数
      console.log('onLoad options:', options)
      // 输出：{ paramA: '123', paramB: 'xyz' }
    })
  },
})
```

## 生命周期组合式 API

Rubic 导出了一系列组合式 API 来注册生命周期钩子。它们的命名和 Page 原始生命周期一致

这些函数接受一个回调，该回调的参数与对应的生命周期一致，当钩子被实例调用时，该回调将被执行。
且 `onXXX` 函数大都能被多次调用，依赖返回值的将会使用最后一次的返回值。

让我们将其添加到 `setup` 函数中：

```ts
import { definePage, onLoad, onShareAppMessage } from 'rubic'

createApp({
  setup(props, context) {
    onLoad(query => {
      console.log('query:', query)
    })
    onShareAppMessage(() => {
      return {
        title: '自定义转发标题',
        path: '/page/user?id=123',
      }
    })
    return {}
  },
})
```

完整的 Page 生命周期组合式 API 函数如下：

```ts
import {
  onLoad,
  onShow,
  onReady,
  onHide,
  onUnload,
  onPullDownRefresh,
  onReachBottom,
  onShareAppMessage,
  onShareTimeline,
  onAddToFavorites,
  onPageScroll,
  onResize,
  onTabItemTap,
  onSaveExitStat,
} from 'rubic'
```

#### 生命周期对应关系

| 组合式 API        | 原生小程序                |
| ----------------- | ------------------------- |
| onLoad            | Page -> onLoad            |
| onShow            | Page -> onShow            |
| onReady           | Page -> onReady           |
| onHide            | Page -> onHide            |
| onUnload          | Page -> onUnload          |
| onPullDownRefresh | Page -> onPullDownRefresh |
| onReachBottom     | Page -> onReachBottom     |
| onShareAppMessage | Page -> onShareAppMessage |
| onShareTimeline   | Page -> onShareTimeline   |
| onAddToFavorites  | Page -> onAddToFavorites  |
| onPageScroll      | Page -> onPageScroll      |
| onResize          | Page -> onResize          |
| onTabItemTap      | Page -> onTabItemTap      |
| onSaveExitStat    | Page -> onSaveExitStat    |
