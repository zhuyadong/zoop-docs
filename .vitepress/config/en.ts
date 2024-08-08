import { defineConfig, DefaultTheme } from 'vitepress'

export const en = defineConfig({
  lang: "en-US",
  description: "Zoop",
  themeConfig: {
    logo: { src: "/zoop-logo-mini.png"},
    nav: [
      { text: "Guide", link: "/en/guide/intro" },
      { text: "Reference", link: "/en/reference/intro" },
    ],
    sidebar: {
      "/en/guide/": { base: "/en/guide/", items: sidebarGuide() },
      "/en/reference/": { base: "/en/reference/", items: sidebarReference() },
    },
    editLink: {
      pattern: "https://github.com/zhuyadong/zoop-docs/edit/main/:path",
      text: "Edit this page on github",
    },
    footer: {
      message: "Released under the MIT License",
      copyright: `Copyright © 2023-${new Date().getFullYear()} Zhu Yadong`,
    },
    docFooter: {
      prev: "Previous page",
      next: "Next page",
    },
    outline: {
      label: "Page navigation",
    },
    lastUpdated: {
      text: "Last updated on",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },
    langMenuLabel: "Multi-language",
    returnToTopLabel: "Back to top",
    sidebarMenuLabel: "Menu",
    darkModeSwitchLabel: "Theme",
    lightModeSwitchTitle: "Switch to light mode",
    darkModeSwitchTitle: "Switch to dark mode",
  },
});

export function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Zoop Introduction",
      link: "intro",
    },
    {
      text: "Basics",
      collapsed: false,
      items: [
        { text: "Installation Configuration", link: "install" },
        { text: "Class Basics", link: "class" },
        { text: "Interface Basics", link: "interface" },
        { text: "Type conversion", link: "as-cast" },
      ],
    },
    {
      text: "Fill in gaps",
      link: "gaps",
    },
    {
      text: "Usage suggestions",
      link: "recommend",
    },
  ];
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Introduction",
      link: "intro",
    },
    {
      text: "Terms and Principles",
      link: "principle",
    },
    {
      text: "API Reference",
      collapsed: false,
      items: [
        { text: "zoop", link: "zoop" },
        { text: "zoop.tuple", link: "tuple" },
        { text: "Class", link: "class" },
        { text: "IObject", link: "iobject" },
        { text: "IRaw", link: "iraw" },
      ],
    },
  ];
}

export const search: DefaultTheme.LocalSearchOptions["locales"] = {
  en: {
    translations: {
      button: {
        buttonText: "Search documents",
        buttonAriaLabel: "Search documents",
      },
      modal: {
        noResultsText: "No relevant results found",
        resetButtonTitle: "Clear query conditions",
        displayDetails: "Display detailed list",
        footer: {
          selectText: "Select",
          navigateText: "Switch",
          closeText: "Close",
        },
      },
    },
  },
};