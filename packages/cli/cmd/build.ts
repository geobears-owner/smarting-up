import { globby } from "globby"
import { ArgumentsCamelCase, InferredOptionTypes } from "yargs"
import { commonFlags } from "./flags"
import { readConfigFile } from "../config"
import { rimraf } from "rimraf"
import { createProcessor, emitContent, filterContent, processMarkdown } from "../processors"
import path from "path"
import { PerfTimer } from "../util"
import chalk from "chalk"
import http from 'http'
import serveHandler from 'serve-handler'

export const BuildArgv = {
  ...commonFlags,
  output: {
    string: true,
    alias: ['o'],
    default: 'public',
    describe: 'output folder for files'
  },
  clean: {
    boolean: true,
    default: false,
    describe: 'clean the output folder before building'
  },
  serve: {
    boolean: true,
    default: false,
    describe: 'run a local server to preview your Quartz'
  },
  port: {
    number: true,
    default: 8080,
    describe: 'port to serve Quartz on'
  }
}

export async function buildQuartz(argv: ArgumentsCamelCase<InferredOptionTypes<typeof BuildArgv>>) {
  const perf = new PerfTimer()
  const cfg = await readConfigFile(argv.directory)
  const output = path.join(argv.directory, argv.output)

  if (argv.verbose) {
    const pluginCount = Object.values(cfg.plugins).flat().length
    const pluginNames = (key: 'transformers' | 'filters' | 'emitters') => cfg.plugins[key].map(plugin => plugin.name)
    console.log(`Loaded ${pluginCount} plugins in ${perf.timeSince('start')}`)
    console.log(`  Transformers: ${pluginNames('transformers').join(", ")}`)
    console.log(`  Filters: ${pluginNames('filters').join(", ")}`)
    console.log(`  Emitters: ${pluginNames('emitters').join(", ")}`)
  }

  if (argv.clean) {
    perf.addEvent('clean')
    await rimraf(output)
    if (argv.verbose) {
      console.log(`Cleaned output directory \`${output}\` in ${perf.timeSince('clean')}`)
    }
  }

  // glob all md, implicitly ignore quartz folder
  perf.addEvent('glob')
  const fps = await globby('**/*.md', {
    cwd: argv.directory,
    ignore: [...cfg.configuration.ignorePatterns, 'quartz/**'],
    gitignore: true,
  })
  if (argv.verbose) {
    console.log(`Found ${fps.length} input files in ${perf.timeSince('glob')}`)
  }

  const processor = createProcessor(cfg.plugins.transformers)
  const filePaths = fps.map(fp => `${argv.directory}${path.sep}${fp}`)
  const processedContent = await processMarkdown(processor, argv.directory, filePaths, argv.verbose)
  const filteredContent = filterContent(cfg.plugins.filters, processedContent, argv.verbose)
  await emitContent(argv.directory, output, cfg, filteredContent, argv.verbose)
  console.log(chalk.green(`Done in ${perf.timeSince()}`))

  if (argv.serve) {
    const server = http.createServer(async (req, res) => {
      return serveHandler(req, res, {
        public: output,
        directoryListing: false
      })
    })
    server.listen(argv.port)
    console.log(`Started a Quartz server listening at http://localhost:${argv.port}`)
    console.log('hint: exit with ctrl+c')
  }
}

