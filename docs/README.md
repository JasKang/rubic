---
home: true
title: Home
heroImage: /images/logo.svg
actions:
  - text: 开始
    link: /guide/
    type: primary
  - text: Github
    link: https://github.com/JasKang/rubic
    type: secondary
features:
  - title: 💡 响应性&组合式
    details: 与 vue3 一致的响应性能力和组合式 API
  - title: ⚡️ 轻量级
    details: 无编译依赖，没有臃肿的运行时
  - title: 🔑 类型化
    details: 基于 TypeScript 编写, 完整的类型文件

footer: MIT Licensed | Copyright © 2022-present jaskang
---

### 和 Vue3 一样的开发方式

```ts
import { defineComponent } from 'rubic'

defineComponent({
  setup() {
    const count = ref(0)
    const increment = () => ++count.value
    return {
      count,
      increment,
    }
  },
})
```

```xml
<view @bind:tap="increment">
{{count}}
<view>
```
