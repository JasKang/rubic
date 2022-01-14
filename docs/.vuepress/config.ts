import { defineUserConfig } from 'vuepress-vite'
import type { DefaultThemeOptions } from 'vuepress-vite'

export default defineUserConfig<DefaultThemeOptions>({
  title: 'Jweapp 中文文档',
  lang: 'zh-CN',
  description: '响应式小程序框架',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/images/logo.svg' }]],
  themeConfig: {
    logo: '/images/logo.svg',
  },
})
