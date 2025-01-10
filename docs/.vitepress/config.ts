import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Climonad.js",
  description: "A CLI framework for fast, modular, and powerful tools.",
  appearance: "force-dark",
  head: [["link", { rel: "icon", href: "/favicon.ico", type: "image/x-icon" }]],
  lastUpdated: true,
  lang: "en-US",
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
  },
  themeConfig: {
    lastUpdated: {
      text: "Updated at",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },
    logo: "/logo.svg",
    langMenuLabel: "Languages",
    search: {
      provider: "local",
    },

    nav: [
      {
        text: "Docs",
        link: "/docs",
        activeMatch: "^/docs",
      },
      {
        text: "Community",
        items: [
          {
            text: "Discussions",
            link: "https://github.com/supitsdu/climonad.js/discussions",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          {
            text: "Contributing",
            link: "https://github.com/supitsdu/climonad.js/blob/main/CONTRIBUTING.md",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          {
            text: "Code of Conduct",
            link: "https://github.com/supitsdu/climonad.js/blob/main/CODE_OF_CONDUCT.md",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          {
            text: "Security Policy",
            link: "https://github.com/supitsdu/climonad.js/blob/main/SECURITY.md",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        ],
      },
    ],
    siteTitle: "Climonad.js",

    aside: true,
    sidebar: [
      {
        text: "Getting Started",
        collapsed: false,
        items: [
          { text: "Why Climonad?", link: "/docs/why-climonad" },
          { text: "Quick Start", link: "/docs/quick-start" },
        ],
      },
      {
        text: "API References",
        collapsed: false,

        items: [
          { text: "Setup", link: "/api/Setup" },
          { text: "Command", link: "/api/Command" },
          { text: "Flag", link: "/api/Flag" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/supitsdu/climonad.js" }],

    footer: {
      message: "Made with ❤️ from Brazil",
      copyright: "Released under the MIT License",
    },
  },
})
