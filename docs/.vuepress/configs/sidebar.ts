import type { SidebarConfig } from '@vuepress/theme-default'

const sidebar: SidebarConfig = {
  '/guide/': [
    {
      text: '指南',
      children: [
        '/guide/README.md',
        '/guide/installation.md',
        '/guide/app.md',
        '/guide/component.md',
        '/guide/page.md',
        '/guide/reactive.md',
        '/guide/composition.md',
      ],
    },
  ],
  '/api/': [
    {
      text: 'API',
      link: '/api/README.md',
    },
  ],
}

export default sidebar
