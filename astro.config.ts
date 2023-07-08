import { defineConfig } from 'astro/config'
import { rehypeHeadingIds as slugifyHeaders } from '@astrojs/markdown-remark'
import generateIdsForHeadings from 'rehype-slug'
import linkHeadings from 'rehype-autolink-headings'
import quartzConfig from './quartz.config'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import copyStaticAssets from './src/plugins/static'
import { processRelativeLinks, wikilinkPreset } from './src/plugins/links'
import { processCodeblocks } from './src/plugins/codeblocks'
import rehypePrettyCode, { Options as CodeOptions } from 'rehype-pretty-code'
const { enableLatex } = quartzConfig

export default defineConfig({
  // TODO: test this more
  // base: '/test/big/subpath',
  integrations: [
    copyStaticAssets
  ],
  markdown: {
    remarkPlugins: [
      wikilinkPreset,
      ...enableLatex ? [remarkMath] : [],
    ],
    rehypePlugins: [
      processCodeblocks,
      [rehypePrettyCode, {
        theme: 'css-variables',
        onVisitLine(node) {
          if (node.children.length === 0) {
            node.children = [{ type: 'text', value: ' ' }]
          }
        },
        onVisitHighlightedLine(node) {
          node.properties.className.push('highlighted')
        },
        onVisitHighlightedWord(node) {
          node.properties.className = ['word']
        },
      } satisfies Partial<CodeOptions>],
      processRelativeLinks,
      slugifyHeaders,
      generateIdsForHeadings,
      [linkHeadings, { behavior: 'wrap' }],
      ...enableLatex ? [rehypeKatex] : []
    ],
    remarkRehype: {
      clobberPrefix: 'article-',
      footnoteBackLabel: 'Go to reference',
    },
    syntaxHighlight: false // handled by rehypePrettyCode
  }
})
