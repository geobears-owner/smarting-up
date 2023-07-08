import { QuartzTransformerPlugin } from "../types"
import rehypePrettyCode, { Options as CodeOptions } from "rehype-pretty-code"

export const SyntaxHighlighting: QuartzTransformerPlugin = () => ({
  name: "SyntaxHighlighting",
  htmlPlugins() {
    return [[rehypePrettyCode, {
      theme: 'css-variables',
      onVisitLine(node) {
        if (node.children.length === 0) {
          node.children = [{ type: 'text', value: ' ' }]
        }
      },
      onVisitHighlightedLine(node) {
        node.properties.className ??= []
        node.properties.className.push('highlighted')
      },
      onVisitHighlightedWord(node) {
        node.properties.className ??= []
        node.properties.className.push('word')
      },
    } satisfies Partial<CodeOptions>]]
  }
})
