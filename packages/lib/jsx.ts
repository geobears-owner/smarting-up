import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Node } from 'hast-util-to-jsx-runtime/lib'
import { Fragment, jsx, jsxs } from 'preact/jsx-runtime'

export function astToJsx(node: Node) {
  return toJsxRuntime(node, {
    Fragment,
    jsx: jsx as Parameters<typeof toJsxRuntime>[1]["jsx"],
    jsxs: jsxs as Parameters<typeof toJsxRuntime>[1]["jsxs"],
    development: false,
    elementAttributeNameCase: 'html'
  })
}
