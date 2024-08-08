import { defineConfig } from 'vitepress'
import {search as zhSearch } from './zh'
import {search as enSearch } from './en'

export const shared = defineConfig({
  base: '/',
  title: 'Zoop',
  rewrites: {
    'zh/:rest*': ':rest*'
  },

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/zoop-logo-mini.png'}],
  ],
  themeConfig: {
    logo: { src: '/zoop-logo-mini.png'},
    search: {
      provider: 'local',
      options: {
        locales: {
          ...zhSearch,
          ...enSearch,
        },
      },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zhuyadong/zoop' }
    ],
  },
})