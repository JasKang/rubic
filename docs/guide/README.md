# 介绍

::: tip 注意
使用 Rubic 需开发者对 Vue3 响应性和组合式 API 有基本的了解，本文档不会过多重复这部分的内容，详情请移步[Vue 官方文档](https://staging-cn.vuejs.org)
:::

## Rubic 是什么

Rubic 是一个轻量级的小程序运行时框架。框架实现了与 Vue3 一致的响应性和组合式 API 能力。

组合式 API 会直接在函数作用域内定义响应式状态，以及将从多个函数中得到的状态组合起来处理复杂问题。这样的方式更自由，同时也需要你对 Rubic 的响应式系统有更深的理解才能高效使用，同时它的灵活性也能帮助你更好地重用逻辑，构建更大规模的应用。

## 特性

- 响应性：基于 @vue/reactivity 的响应式能力。
- 组合式 API：与 vue3 一致的 Composition API。
- 类型化：丰富的 Typescript 类型提示。
- 轻量级：不依赖编译，原生小程序可直接接入。

## 兼容性

Rubic 响应性能力直接依赖 [@vue/reactivity]，所以 Rubic 需要运行环境原生支持 `Proxy`。

- iOS: >= iOS 10
- Android: >= Android 5.0
- 微信小程序基础库: >= v2.11.0

[小程序的基础库 ECMAScript 支持表](https://wechat-miniprogram.github.io/miniprogram-compat/#2_11_0)
