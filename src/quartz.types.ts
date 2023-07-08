export interface FrontMatter {
  title: string,
  alias: string,
  aliases: string[],
}

export interface ColorScheme {
  light: string,
  lightgray: string,
  gray: string,
  darkgray: string,
  dark: string,
  secondary: string,
  tertiary: string,
  highlight: string
}

export type ValidComponent =
  | { type: 'title', options?: {} }
  | { type: 'spacer', options?: {} }
  | { type: 'search', options?: {} }
  | { type: 'darkModeToggle', options?: {} }
  | { type: 'tableOfContents', options?: {} }
  | { type: 'content', options?: {} }

/**
  Desktop Layout Guide
  (parentheses represents flex direction)
  ┌──────────┬────────────────┬──────────┐
  │          │     header     │          │
  │          │  (horizontal)  │          │
  │          ├────────────────┤          │
  │          │                │          │
  │          │                │          │
  │   left   │     center     │   right  │
  │(vertical)│   (vertical)   │(vertical)│
  │          │                │          │
  │          │                │          │
  │          ├────────────────┤          │
  │          │     footer     │          │
  │          │   (vertical)   │          │
  └──────────┴────────────────┴──────────┘

  On mobile, this
  is truncated to
  ┌────────────────┐
  │     header     │
  │  (horizontal)  │
  ├────────────────┤
  │                │
  │     center     │
  │   (vertical)   │
  │                │
  ├────────────────┤
  │      left      │
  │   (vertical)   │
  ├────────────────┤
  │     right      │
  │   (vertical)   │
  ├────────────────┤
  │     footer     │
  │   (vertical)   │
  └────────────────┘
*/
export interface Layout {
  left: ValidComponent[]
  right: ValidComponent[]
  header: ValidComponent[]
  center: ValidComponent[]
  footer: ValidComponent[]
}

export const DefaultLayout: Layout = {
  left: [],
  right: [],
  header: [],
  center: [],
  footer: []
}

export interface QuartzConfig {
  siteTitle: string,
  /** How to resolve Markdown paths */
  markdownLinkResolution: 'absolute' | 'relative'
  /** Strips folders from a link so that it looks nice */
  prettyLinks: boolean
  /** Whether to process and render latex (increases bundle size) */
  enableLatex: boolean,
  /** Whether to enable single-page-app style rendering. this prevents flashes of unstyled content and improves smoothness of Quartz */
  enableSPA: boolean,
  theme: {
    typography: {
      header: string,
      body: string,
      code: string
    },
    colors: {
      lightMode: ColorScheme,
      darkMode: ColorScheme
    }
  }
}
