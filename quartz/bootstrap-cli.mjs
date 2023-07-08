#!/usr/bin/env node
import { promises, readFileSync } from 'fs'
import yargs from 'yargs'
import path from 'path'
import { hideBin } from 'yargs/helpers'
import esbuild from 'esbuild'
import chalk from 'chalk'
import { sassPlugin } from 'esbuild-sass-plugin'
import fs from 'fs'
import { intro, isCancel, outro, select, text } from '@clack/prompts'
import { rimraf } from 'rimraf'

const cacheFile = "./.quartz-cache/transpiled-build.mjs"
const fp = "./quartz/build.ts"
const { version } = JSON.parse(readFileSync("./package.json").toString())

export const BuildArgv = {
  output: {
    string: true,
    alias: ['o'],
    default: 'public',
    describe: 'output folder for files'
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
  },
  directory: {
    string: true,
    alias: ['d'],
    default: 'content',
    describe: 'directory to look for content files'
  },
  verbose: {
    boolean: true,
    alias: ['v'],
    default: false,
    describe: 'print out extra logging information'
  }
}

function escapePath(fp) {
  return fp
    .replace(/\\ /g, " ") // unescape spaces
    .replace(/^".*"$/, "$1")
    .replace(/^'.*"$/, "$1")
    .trim()
}

yargs(hideBin(process.argv))
  .scriptName("quartz")
  .version(version)
  .usage('$0 <cmd> [args]')
  .command('create', 'Initialize Quartz', async (_argv) => {
    console.log()
    intro(chalk.bgGreen.black(` Quartz v${version} `))
    const contentFolder = path.join(process.cwd(), "content")
    const setupStrategy = await select({
      message: `Choose how to initialize the content in \`${contentFolder}\``,
      options: [
        { value: 'new', label: "Empty Quartz" },
        { value: 'copy', label: "Replace with an existing folder", hint: "overwrites `content`" },
        { value: 'symlink', label: "Symlink an existing folder", hint: "don't select this unless you know what you are doing!" },
        { value: 'keep', label: "Keep the existing files" },
      ]
    })

    if (isCancel(setupStrategy)) {
      outro(chalk.red("Exiting"))
      process.exit(0)
    }

    async function rmContentFolder() {
      const contentStat = await fs.promises.lstat(contentFolder)
      if (contentStat) {
        if (contentStat.isSymbolicLink()) {
          await fs.promises.unlink(contentFolder)
        } else {
          await rimraf(contentFolder)
        }
      }
    }

    if (setupStrategy === 'copy' || setupStrategy === 'symlink') {
      const originalFolder = escapePath(await text({
        message: "Enter the full path to existing content folder",
        placeholder: 'On most terminal emulators, you can drag and drop a folder into the window and it will paste the full path',
        validate(fp) {
          const fullPath = escapePath(fp)
          if (!fs.existsSync(fullPath)) {
            return "The given path doesn't exist"
          } else if (!fs.lstatSync(fullPath).isDirectory()) {
            return "The given path is not a folder"
          }
        }
      }))

      if (isCancel(originalFolder)) {
        outro(chalk.red("Exiting"))
        process.exit(0)
      }

      await rmContentFolder()
      if (setupStrategy === 'copy') {
        await fs.promises.cp(originalFolder, contentFolder, { recursive: true })
      } else if (setupStrategy === 'symlink') {
        await fs.promises.symlink(originalFolder, contentFolder, 'dir')
      }
    } else if (setupStrategy === 'new') {
      await rmContentFolder()
      await fs.promises.mkdir(contentFolder)
      await fs.promises.writeFile(path.join(contentFolder, "index.md"),
        `---
title: Welcome to Quartz
---

This is a blank Quartz installation.
See the [documentation](https://quartz.jzhao.xyz) for how to get started.
`
      )
    }

    outro(`You're all set! Not sure what to do next? Try:
   • Customizing Quartz a bit more by editing \`quartz.config.ts\`
   • Running \`npx quartz build --serve\` to preview your Quartz locally
   • Hosting your Quartz online (see: https://quartz.jzhao.xyz/setup/hosting)
`)
  })
  .command('build', 'Build Quartz into a bundle of static HTML files', BuildArgv, async (argv) => {
    await esbuild.build({
      entryPoints: [fp],
      outfile: path.join("quartz", cacheFile),
      bundle: true,
      keepNames: true,
      platform: "node",
      format: "esm",
      jsx: "automatic",
      jsxImportSource: "preact",
      packages: "external",
      plugins: [
        sassPlugin({
          type: 'css-text',
        }),
        {
          name: 'inline-script-loader',
          setup(build) {
            build.onLoad({ filter: /\.inline\.(ts|js)$/ }, async (args) => {
              let text = await promises.readFile(args.path, 'utf8')
              // remove default exports that we manually inserted
              text = text.replace('export default', '')
              text = text.replace('export', '')

              const sourcefile = path.relative(path.resolve('.'), args.path)
              const resolveDir = path.dirname(sourcefile)
              const transpiled = await esbuild.build({
                stdin: {
                  contents: text,
                  loader: 'ts',
                  resolveDir,
                  sourcefile,
                },
                write: false,
                bundle: true,
                platform: "browser",
                format: "esm",
              })
              const rawMod = transpiled.outputFiles[0].text
              return {
                contents: rawMod,
                loader: 'text',
              }
            })
          }
        }
      ]
    }).catch(err => {
      console.error(`${chalk.red("Couldn't parse Quartz configuration:")} ${fp}`)
      console.log(`Reason: ${chalk.grey(err)}`)
      console.log("hint: make sure all the required dependencies are installed (run `npm install`)")
      process.exit(1)
    })

    const { default: init } = await import(cacheFile)
    init(argv, version)
  })
  .showHelpOnFail(false)
  .help()
  .strict()
  .demandCommand()
  .argv
