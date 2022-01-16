import { defineUserConfig } from 'vuepress-vite'
import type { DefaultThemeOptions } from 'vuepress-vite'
import { navbar, sidebar } from './configs'

export default defineUserConfig<DefaultThemeOptions>({
  title: 'Rubic',
  lang: 'zh-CN',
  description: '基于 Vue3 的小程序开发框架',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/images/logo.svg' }]],
  themeConfig: {
    logo: '/images/logo.svg',
    navbar,
    sidebar,
  },
})
