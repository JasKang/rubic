import { defineUserConfig } from 'vuepress-vite'
import type { DefaultThemeOptions } from 'vuepress-vite'

export default defineUserConfig<DefaultThemeOptions>({
  lang: 'zh-CN',
  title: 'Jweapp',
  description: 'Just playing around',

  themeConfig: {
    logo: '/images/logo.svg',
  },
})
