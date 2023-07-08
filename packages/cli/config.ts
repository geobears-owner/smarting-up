import t, { Infer } from 'myzod'
import path from 'path'
import requireFromString from 'require-from-string'
import chalk from 'chalk'
import { version } from './package.json'
import esbuild from 'esbuild'
import fs from 'fs'
import { Data, PluginTypes } from '@jackyzha0/quartz-plugins'
import { ComponentTypes } from '@jackyzha0/quartz-lib/types'

export interface UserProvidedConfig {
  quartzVersion: string,
  hydrateInteractiveComponents: boolean,
  name: string,
}

export const configSchema = t.object({
  quartzVersion: t.string(),
  name: t.string(),
  hydrateInteractiveComponents: t.boolean(),
  ignorePatterns: t.array(t.string()),
})


export type ValidComponentName = keyof QuartzConfig["components"]
export interface QuartzConfig {
  plugins: PluginTypes,
  configuration: Infer<typeof configSchema>,
  components: ComponentTypes<Data>
}

export function isValidConfig(cfg: any): cfg is QuartzConfig {
  const requiredKeys = ["plugins", "configuration", "components"]
  for (const key of requiredKeys) {
    if (!cfg.hasOwnProperty(key)) {
      console.log(`${chalk.yellow("Warning:")} Configuration is missing required field \`${key}\``)
      return false
    }
  }

  const requiredPlugins = ["transformers", "filters", "emitters"]
  for (const key of requiredPlugins) {
    if (!cfg.plugins.hasOwnProperty(key)) {
      console.log(`${chalk.yellow("Warning:")} Configuration is missing required field \`plugins.${key}\``)
      return false
    }
  }

  const requiredComponents = ["pageSingle", "pageList", "pageHome", "head"]
  for (const key of requiredComponents) {
    if (!cfg.components.hasOwnProperty(key)) {
      console.log(`${chalk.yellow("Warning:")} Configuration is missing required field \`components.${key}\``)
      return false
    }
  }

  const validationResult = configSchema.try(cfg.configuration)
  if (validationResult instanceof t.ValidationError) {
    console.log(`${chalk.yellow("Warning:")} Configuration doens't match schema. ${validationResult.message}`)
    return false
  }

  return true
}

export const QUARTZ = "quartz"
export const QUARTZ_CONFIG_NAME = "quartz.config.js"

export function getQuartzPath(directory: string) {
  return path.resolve(path.join(directory, QUARTZ))
}

export function getConfigFilePath(directory: string) {
  return path.resolve(path.join(directory, QUARTZ, QUARTZ_CONFIG_NAME))
}

export async function readConfigFile(directory: string): Promise<QuartzConfig> {
  const fp = path.resolve(path.join(directory, QUARTZ, QUARTZ_CONFIG_NAME))

  if (!fs.existsSync(fp)) {
    console.error(`${chalk.red("Couldn't find Quartz configuration:")} ${fp}`)
    console.log("hint: you can initialize a new Quartz with `quartz new`")
    process.exit(1)
  }

  const out = await esbuild.build({
    entryPoints: [fp],
    write: false,
    minifySyntax: true,
    minifyWhitespace: true,
    bundle: true,
    packages: "external",
    keepNames: true,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    jsxImportSource: "preact",
  }).catch(err => {
    console.error(`${chalk.red("Couldn't parse Quartz configuration:")} ${fp}`)
    console.log(`Reason: ${chalk.grey(err)}`)
    console.log("hint: make sure all the required dependencies are installed (run `npm install` in the `quartz` folder)")
    process.exit(1)
  })

  const mod = out.outputFiles![0].text
  console.log(mod)
  const cfg: QuartzConfig = requireFromString(mod, fp).default
  if (!isValidConfig(cfg)) {
    console.error(chalk.red("Invalid Quartz configuration"))
    process.exit(1)
  }

  if (cfg.configuration.quartzVersion !== version) {
    console.log(`${chalk.yellow("Warning:")} version in configuration (${cfg.configuration.quartzVersion}) is different from current Quartz version (${version}). Proceed with caution!`)
  }

  return cfg
}

export async function templateQuartzFolder(directory: string, cfg: UserProvidedConfig) {
  const parentFolder = path.join(__dirname, "template")
  const quartzDirectory = getQuartzPath(directory)
  await fs.promises.cp(parentFolder, quartzDirectory, { recursive: true })

  // template quartz.config.js
  const configFilePath = getConfigFilePath(directory)
  const buf = await fs.promises.readFile(configFilePath)
  let s = buf.toString()

  for (const [k, v] of Object.entries(cfg)) {
    if (typeof v === 'string') {
      s = s.replace(`__${k}`, `"${v}"`)
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      s = s.replace(`__${k}`, `${v}`)
    }
  }

  await fs.promises.writeFile(configFilePath, s)
}
