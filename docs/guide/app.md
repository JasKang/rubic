# 小程序实例

## 创建小程序实例

每个小程序都是通过用 `createApp` 函数创建一个新的小程序实例开始的：

```ts
import { createApp } from 'rubic'

createApp({
  setup() {
    /* 选项 */
  },
})
```

`setup` 函数对应原生小程序 `App`->`onLaunch` 回调。参数与 `onLaunch` 一致，返回值将会合并到 app 实例。

```ts
import { createApp } from 'rubic'

createApp({
  setup(options) {
    console.log(options)
    return {
      globalData: {},
    }
  },
})
```

## 生命周期组合式 API

Rubic 导出了一系列组合式 API 来注册生命周期钩子。它们的命名和小程序原始生命周期类似，但前缀为由 `onXXX` 替换为 `onAppXXX`：即 `onShow` 看起来会像 `onAppShow`，

这些函数接受一个回调，该回调的参数与对应的生命周期一致，当钩子被实例调用时，该回调将被执行。
且 `onAppXXX` 函数大都能被多次调用，依赖返回值的将会使用最后一次的返回值。

让我们将其添加到 `setup` 函数中：

```ts
import { createApp, onAppShow, onAppPageNotFound } from 'rubic'

createApp({
  setup(options) {
    //
    onAppShow(args => {
      console.log('onAppShow args.path:', args.path)
    })

    onAppPageNotFound(args => {
      console.log('onAppPageNotFound args.path', args.path)
    })

    return {
      globalData: {},
    }
  },
})
```

完整的 App 生命周期组合式 API 函数如下：

```ts
import {
  onAppShow,
  onAppHide,
  onAppError,
  onAppPageNotFound,
  onAppUnhandledRejection,
  onAppThemeChange,
} from 'rubic'
```

#### 生命周期对应关系

| 原生小程序                  | 组合式 API              |
| --------------------------- | ----------------------- |
| App -> onLaunch             | createApp -> setup      |
| App -> onShow               | onAppShow               |
| App -> onHide               | onAppHide               |
| App -> onError              | onAppError              |
| App -> onPageNotFound       | onAppPageNotFound       |
| App -> onUnhandledRejection | onAppUnhandledRejection |
| App -> onThemeChange        | onAppThemeChange        |
