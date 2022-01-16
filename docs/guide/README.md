# 介绍

## rubic 是什么

rubic 轻量级的小程序框架。框架基于 @vue/reactivity 实现了与 Vue3 一致的响应性和组合式 API。

## 特性

- 响应性：基于 @vue/reactivity 的响应式能力
- 组合式：与 vue3 一致的 Composition API
- 类型化：丰富的 Typescript 类型提示
- 轻量级：不依赖编译，原生小程序可直接接入

## 兼容性

Rubic 响应性能力直接依赖 [@vue/reactivity]，所以 Rubic 需要运行环境原生支持 `Proxy`。

- iOS: >= iOS 10
- Android: >= Android 5.0
- 微信小程序基础库: >= v2.11.0

[小程序的基础库 ECMAScript 支持表](https://wechat-miniprogram.github.io/miniprogram-compat/#2_11_0)
