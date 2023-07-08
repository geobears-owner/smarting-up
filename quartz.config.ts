import { PageLayout, QuartzConfig } from "./quartz/cfg"
import * as Component from "./quartz/components"
import * as Plugin from "./quartz/plugins"

const sharedPageComponents = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    authorName: "Jacky",
    links: {
      "GitHub": "https://github.com/jackyzha0",
      "Twitter": "https://twitter.com/_jzhao"
    }
  })
}

const contentPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ReadingTime(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
  right: [
    Component.Graph(),
    Component.Backlinks(),
  ],
}

const listPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle()
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode()
  ],
  right: [],
}

const config: QuartzConfig = {
  configuration: {
    pageTitle: "🪴 Quartz 4.0",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: 'plausible',
    },
    canonicalUrl: "quartz.jzhao.xyz",
    ignorePatterns: ["private", "templates"],
    theme: {
      typography: { // loaded from Google Fonts
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: '#faf8f8',
          lightgray: '#e5e5e5',
          gray: '#b8b8b8',
          darkgray: '#4e4e4e',
          dark: '#141021',
          secondary: '#284b63',
          tertiary: '#84a59d',
          highlight: 'rgba(143, 159, 169, 0.15)',
        },
        darkMode: {
          light: '#161618',
          lightgray: '#393639',
          gray: '#646464',
          darkgray: '#d4d4d4',
          dark: '#fbfffe',
          secondary: '#7b97aa',
          tertiary: '#84a59d',
          highlight: 'rgba(143, 159, 169, 0.15)',
        },
      }
    }
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.TableOfContents(),
      Plugin.CreatedModifiedDate({
        priority: ['frontmatter', 'filesystem'] // you can add 'git' here for last modified from Git but this makes the build slower
      }),
      Plugin.ObsidianFlavoredMarkdown(),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.CrawlLinks(),
      Plugin.SyntaxHighlighting(),
      Plugin.Katex(),
      Plugin.Description(),
    ],
    filters: [
      Plugin.RemoveDrafts(),
    ],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ContentPage({
        ...sharedPageComponents,
        ...contentPageLayout,
        pageBody: Component.Content(),
      }),
      Plugin.FolderPage({
        ...sharedPageComponents,
        ...listPageLayout,
        pageBody: Component.FolderContent(),
      }),
      Plugin.TagPage({
        ...sharedPageComponents,
        ...listPageLayout,
        pageBody: Component.TagContent(),
      }),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
    ]
  },
}

export default config
