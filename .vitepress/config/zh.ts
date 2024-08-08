import { defineConfig, DefaultTheme } from 'vitepress'

export const zh = defineConfig({
  lang: "zh-Hans",
  description: "Zoop",
  themeConfig: {
    logo: { src: "/zoop-logo-mini.png"},
    nav: [
      { text: "指南", link: "/guide/intro" },
      { text: "参考", link: "/reference/intro" },
    ],
    sidebar: {
      "/guide/": { base: "/guide/", items: sidebarGuide() },
      "/reference/": { base: "/reference/", items: sidebarReference() },
    },
    editLink: {
      pattern: "https://github.com/zhuyadong/zoop-docs/edit/main/:path",
      text: "在 github 上编辑此页面",
    },
    footer: {
      message: "基于 MIT 许可发布",
      copyright: `版权所有 © 2023-${new Date().getFullYear()} 朱亚东`,
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    outline: {
      label: "页面导航",
    },
    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },
    langMenuLabel: "多语言",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },
});

export function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Zoop 简介",
      link: "intro",
    },
    {
          text: "基础",
          collapsed: false,
          items: [
            { text: "安装配置", link: "install" },
            { text: "类的基础", link: "class" },
            { text: "接口基础", link: "interface" },
            { text: "类型转换", link: "as-cast" },
          ],
    },
    {
      text: '查漏补缺',
      link: 'gaps',
    },
    {
      text: "使用建议",
      link: "recommend",
    },
  ];
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "简介",
      link: "intro",
    },
    {
      text: "术语和原理",
      link: "principle",
    },
    {
      text: "API 参考",
      collapsed: false,
      items: [
        {text: 'zoop', link: 'zoop'},
        {text: 'zoop.tuple', link: 'tuple'},
        {text: 'Class', link: 'class'},
        {text: 'IObject', link: 'iobject'},
        {text: 'IRaw', link: 'iraw'},
      ]
    },
  ];
}

export const search: DefaultTheme.LocalSearchOptions["locales"]  = {
    root: {
      translations: {
        button: {
          buttonText: "搜索文档",
          buttonAriaLabel: "搜索文档",
        },
        modal: {
          noResultsText: "无法找到相关结果",
          resetButtonTitle: "清除查询条件",
          displayDetails: "显示详细列表",
          footer: {
            selectText: "选择",
            navigateText: "切换",
            closeText: "关闭",
          },
        },
      },
    },
  }