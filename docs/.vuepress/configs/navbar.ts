import type { NavbarConfig } from '@vuepress/theme-default'
import { version } from './meta'

const navbar: NavbarConfig = [
  {
    text: '指南',
    link: '/guide/',
  },
  {
    text: '插件',
    children: [
      {
        text: '常用功能',
        children: [
          '/reference/plugin/back-to-top.md',
          '/reference/plugin/container.md',
          '/reference/plugin/external-link-icon.md',
          '/reference/plugin/google-analytics.md',
          '/reference/plugin/medium-zoom.md',
          '/reference/plugin/nprogress.md',
          '/reference/plugin/register-components.md',
        ],
      },
      {
        text: '内容搜索',
        children: ['/reference/plugin/docsearch.md', '/reference/plugin/search.md'],
      },
      {
        text: 'PWA',
        children: ['/reference/plugin/pwa.md', '/reference/plugin/pwa-popup.md'],
      },
      {
        text: '语法高亮',
        children: ['/reference/plugin/prismjs.md', '/reference/plugin/shiki.md'],
      },
      {
        text: '主题开发',
        children: [
          '/reference/plugin/active-header-links.md',
          '/reference/plugin/debug.md',
          '/reference/plugin/git.md',
          '/reference/plugin/palette.md',
          '/reference/plugin/theme-data.md',
          '/reference/plugin/toc.md',
        ],
      },
    ],
  },
  {
    text: `v${version}`,
    children: [
      {
        text: '更新日志',
        link: 'https://github.com/vuepress/vuepress-next/blob/main/CHANGELOG.md',
      },
    ],
  },
]

export default navbar
