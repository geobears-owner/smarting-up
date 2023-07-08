import remarkParse from 'remark-parse'
import { Processor, unified } from 'unified'
import remarkRehype from 'remark-rehype'
import { Actions, Data, QuartzFilterPlugin, QuartzTransformerPlugin, getStaticResourcesFromPlugins } from '@jackyzha0/quartz-plugins'
import { Root as MDRoot } from 'remark-parse/lib'
import { Root as HTMLRoot } from 'hast'
import { read } from 'to-vfile'
import path from 'path'
import fs from 'fs'
import { pathToSlug } from '@jackyzha0/quartz-lib'
import { ProcessedContent } from '@jackyzha0/quartz-lib/types'
import { createBuildPageAction } from './renderer'
import { QuartzConfig, getQuartzPath } from './config'
import { PerfTimer } from './util'
import { HYDRATION_SCRIPT, transpileHydrationScript } from './hydration'

export type QuartzProcessor = Processor<MDRoot, HTMLRoot, void>
export function createProcessor(plugins: QuartzTransformerPlugin[]): QuartzProcessor {
  // base Markdown -> MD AST
  let processor = unified().use(remarkParse)

  // MD AST -> MD AST transforms
  for (const plugin of plugins) {
    processor = processor.use(plugin.markdownPlugins())
  }

  // MD AST -> HTML AST
  processor = processor.use(remarkRehype, { allowDangerousHtml: true })


  // HTML AST -> HTML AST transforms
  for (const plugin of plugins) {
    processor = processor.use(plugin.htmlPlugins())
  }

  return processor as Processor<MDRoot, HTMLRoot, void>
}

export async function processMarkdown(processor: QuartzProcessor, baseDir: string, fps: string[], verbose: boolean): Promise<ProcessedContent<Data>[]> {
  const perf = new PerfTimer()
  const res: ProcessedContent<Data>[] = []
  for (const fp of fps) {
    const file = await read(fp)

    // base data properties that plugins may use
    file.data.slug = pathToSlug(path.relative(baseDir, file.path))
    file.data.filePath = fp

    const ast = processor.parse(file)
    res.push([await processor.run(ast, file), file])

    if (verbose) {
      console.log(`[process] ${fp} -> ${file.data.slug}`)
    }
  }

  if (verbose) {
    console.log(`Parsed and transformed ${res.length} Markdown files in ${perf.timeSince()}`)
  }
  return res
}

export function filterContent(plugins: QuartzFilterPlugin[], content: ProcessedContent<Data>[], verbose: boolean): ProcessedContent<Data>[] {
  const perf = new PerfTimer()
  const initialLength = content.length
  for (const plugin of plugins) {
    content = content.filter(plugin.shouldPublish)
  }

  if (verbose) {
    console.log(`Filtered out ${initialLength - content.length} files in ${perf.timeSince()}`)
  }
  return content
}

export async function emitContent(input: string, output: string, cfg: QuartzConfig, content: ProcessedContent<Data>[], verbose: boolean) {
  const perf = new PerfTimer()

  const staticResources = getStaticResourcesFromPlugins(cfg.plugins.transformers)
  if (cfg.configuration.hydrateInteractiveComponents) {
    perf.addEvent('transpileHydration')
    const outFile = path.join(output, HYDRATION_SCRIPT)
    const { metafile } = await transpileHydrationScript(input, outFile)

    for (const [k, v] of Object.entries(metafile.outputs)) {
      // TODO
    }

    if (verbose) {
      console.log(`Transpiled client-side hydration script in ${perf.timeSince('transpileHydration')}`)
      console.log(`[emit:Hydration] ${outFile}`)
    }
  }

  const actions: Actions = {
    buildPage: createBuildPageAction(output, cfg, staticResources)
  }

  perf.addEvent('emitters')
  let emittedFiles = 0
  for (const emitter of cfg.plugins.emitters) {
    const emitted = await emitter.emit(content, actions)
    emittedFiles += emitted.length

    if (verbose) {
      for (const file of emitted) {
        console.log(`[emit:${emitter.name}] ${file}`)
      }
    }
  }

  const staticPath = path.join(getQuartzPath(input), "static")
  await fs.promises.cp(staticPath, path.join(output, "static"), { recursive: true })

  if (verbose) {
    console.log(`[emit:Static] ${path.join(output, "static")}`)
    console.log(`Emitted ${emittedFiles} files to \`${output}\` in ${perf.timeSince('emitters')}`)
  }
}
