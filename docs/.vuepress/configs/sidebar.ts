import type { SidebarConfig } from '@vuepress/theme-default'

const sidebar: SidebarConfig = {
  '/guide/': [
    {
      text: '基础',
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
      text: '深入',
      children: ['/advanced/architecture.md', '/advanced/plugin.md', '/advanced/theme.md'],
    },
  ],
}

export default sidebar
