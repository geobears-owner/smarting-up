import type { RehypePlugin } from "@astrojs/markdown-remark"
import { visit } from 'unist-util-visit'

export const processCodeblocks: () => ReturnType<RehypePlugin> = () => (tree, vfile) => {
  // make code blocks default text
  visit(tree, 'element', (node, _index, _parent) => {
    if (
      node.tagName === 'pre' &&
      node.children?.length > 0
    ) {
      const code = node.children[0] as any
      if (!Array.isArray(code.properties.className)) {
        code.properties.className = ['language-plaintext']
      }
    }
  })
}
