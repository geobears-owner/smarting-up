import { PluggableList } from "unified"
import { QuartzTransformerPlugin } from "../types"
import remarkGfm from "remark-gfm"
import smartypants from 'remark-smartypants'

export interface Options {
  enableSmartyPants: boolean
}

const defaultOptions: Options = {
  enableSmartyPants: true
}

export class GitHubFlavoredMarkdown extends QuartzTransformerPlugin {
  name = "GitHubFlavoredMarkdown"
  opts: Options

  constructor(opts?: Options) {
    super()
    this.opts = { ...defaultOptions, ...opts }
  }

  markdownPlugins(): PluggableList {
    return this.opts.enableSmartyPants ? [remarkGfm] : [remarkGfm, smartypants]
  }

  htmlPlugins(): PluggableList {
    return []
  }
}
