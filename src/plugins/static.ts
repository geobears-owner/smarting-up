import type { AstroIntegration } from "astro"
import { globbyStream } from 'globby'
import fs from 'fs'
import path from 'path'
import { rimraf } from 'rimraf'
import { slugify } from "../util/path"

const copyStaticAssets: AstroIntegration = {
  name: 'copy-static-assets-to-public',
  hooks: {
    "astro:config:setup": async (options) => {
      const assetsPath = path.join("public", "assets")
      if (!options.isRestart) {
        await rimraf(assetsPath)
      }

      // glob all non MD/MDX/HTML files in content folder and copy it over
      for await (const fp of globbyStream("**", {
        ignore: ["**/*.{md,mdx,html}"],
        cwd: "./content",
      })) {
        const ext = path.extname(fp as string)
        const src = path.join("content", fp as string)
        const dest = path.join(assetsPath, slugify(fp as string) + ext)
        const dir = path.dirname(dest)
        await fs.promises.mkdir(dir, { recursive: true }) // ensure dir exists
        await fs.promises.copyFile(src, dest)
      }
    }
  }
}

export default copyStaticAssets
