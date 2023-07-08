import type { RehypePlugin, RemarkPlugin } from "@astrojs/markdown-remark"
import wikilinks from '@flowershow/remark-wiki-link'
import { slugFromPath, slugify, relativeToRoot, relative, isAbsolute } from '../util/path'
import isAbsoluteUrl from "is-absolute-url"
import quartzConfig from "../../quartz.config"
import { visit } from 'unist-util-visit'
import path from 'path'

const usesRelativePaths = quartzConfig.markdownLinkResolution === 'relative'
const prettyLinks = quartzConfig.prettyLinks
export const processRelativeLinks: () => ReturnType<RehypePlugin> = () => (tree, vfile) => {
  const curSlug = slugFromPath(vfile.cwd, vfile.history[0])
  const transformLink = (target: string) => {
    const targetSlug = slugify(decodeURI(target))
    if (usesRelativePaths && !isAbsolute(targetSlug)) {
      return './' + relative(curSlug, targetSlug)
    } else {
      return './' + relativeToRoot(curSlug, targetSlug)
    }
  }

  // rewrite all links
  visit(tree, 'element', (node, _index, _parent) => {
    if (
      node.tagName === 'a' &&
      node.properties &&
      typeof node.properties.href === 'string'
    ) {
      node.properties.className = isAbsoluteUrl(node.properties.href) ? "external" : "internal"

      // don't process external links or intra-document anchors
      if (!(isAbsoluteUrl(node.properties.href) || node.properties.href.startsWith("#"))) {
        node.properties.href = transformLink(node.properties.href)
      }

      if (prettyLinks && node.children.length === 1 && node.children[0].type === 'text') {
        node.children[0].value = path.basename(node.children[0].value)
      }
    }
  })

  // transform all images
  visit(tree, 'element', (node, _index, _parent) => {
    if (
      node.tagName === 'img' &&
      node.properties &&
      typeof node.properties.src === 'string'
    ) {
      if (!isAbsoluteUrl(node.properties.src)) {
        const ext = path.extname(node.properties.src)
        node.properties.src = transformLink("/assets/" + node.properties.src) + ext
      }
    }
  })
}

export const wikilinkPreset = [wikilinks, {
  pathFormat: usesRelativePaths ? 'raw' : 'obsidian-absolute'
}] as [RemarkPlugin, any]
