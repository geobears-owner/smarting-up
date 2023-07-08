import { PluggableList } from "unified"
import { QuartzTransformerPlugin } from "../types"
import fs from "fs"
import { promisify } from "util"
import { exec as execCb } from 'child_process'
const exec = promisify(execCb)
import path from 'path'

export interface Options {
  priority: ('frontmatter' | 'git' | 'filesystem')[],
}

const defaultOptions: Options = {
  priority: ['frontmatter', 'git', 'filesystem']
}

export class CreatedModifiedDate extends QuartzTransformerPlugin {
  name = "CreatedModifiedDate"
  opts: Options

  constructor(opts: Options) {
    super()
    this.opts = {
      ...defaultOptions,
      ...opts,
    }
  }

  markdownPlugins(): PluggableList {
    return [
      () => {
        return async (_tree, file) => {
          let created: undefined | Date = undefined
          let modified: undefined | Date = undefined
          let published: undefined | Date = undefined

          const fp = path.join(file.cwd, file.data.filePath as string)
          for (const source of this.opts.priority) {
            if (source === "filesystem") {
              const st = await fs.promises.stat(fp)
              created ||= new Date(st.birthtimeMs)
              modified ||= new Date(st.mtimeMs)
            } else if (source === "frontmatter" && file.data.frontmatter) {
              created ||= file.data.frontmatter.date
              modified ||= file.data.frontmatter.lastmod
              modified ||= file.data.frontmatter["last-modified"]
              published ||= file.data.frontmatter.publishDate
            } else if (source === "git") {
              const { stdout } = await exec(`git log --pretty=format:%ci --follow -- "${fp}"`)
              const lines = stdout.split("\n")
              if (lines.length > 0) {
                modified ||= new Date(lines[0])
                created ||= new Date(lines.pop()!)
              }
            }
          }

          file.data.dates = {
            created: created ?? new Date(),
            modified: modified ?? new Date(),
            published: published ?? new Date()
          }
        }
      }
    ]
  }

  htmlPlugins(): PluggableList {
    return []
  }
}

declare module 'vfile' {
  interface DataMap {
    dates: {
      created: Date
      modified: Date
      published: Date
    }
  }
}

