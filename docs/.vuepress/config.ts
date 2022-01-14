import { defineUserConfig } from 'vuepress-vite'
import type { DefaultThemeOptions } from 'vuepress-vite'
import { navbar, sidebar } from './configs'

export default defineUserConfig<DefaultThemeOptions>({
  title: 'Marci 小程序框架',
  lang: 'zh-CN',
  description: '新一代小程序开发框架',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/images/logo.svg' }]],
  themeConfig: {
    logo: '/images/logo.svg',
    navbar,
    sidebar,
  },
})
