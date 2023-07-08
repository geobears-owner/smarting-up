import { PluggableList } from "unified"
import { QuartzTransformerPlugin } from "../types"
import remarkMath from "remark-math"
import rehypeKatex from 'rehype-katex'
import { StaticResources } from "@jackyzha0/quartz-lib/types"

export class Katex extends QuartzTransformerPlugin {
  name = "Katex"
  markdownPlugins(): PluggableList {
    return [remarkMath]
  }

  htmlPlugins(): PluggableList {
    return [
      [rehypeKatex, {
        output: 'html',
      }]
    ]
  }

  externalResources: Partial<StaticResources> = {
    css: [
      // base css
      "https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css",
    ],
    js: [
      {
        // fix copy behaviour: https://github.com/KaTeX/KaTeX/blob/main/contrib/copy-tex/README.md
        src: "https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/contrib/copy-tex.min.js",
        loadTime: "afterDOMReady"
      }
    ]
  }
}

