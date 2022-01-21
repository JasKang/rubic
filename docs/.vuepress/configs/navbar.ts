import type { NavbarConfig } from '@vuepress/theme-default'
import { version } from './meta'

const navbar: NavbarConfig = [
  {
    text: '指南',
    link: '/guide/',
  },
  {
    text: 'API',
    link: '/api/',
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
  {
    text: 'Github',
    link: 'https://github.com/JasKang/rubic',
  },
]

export default navbar
