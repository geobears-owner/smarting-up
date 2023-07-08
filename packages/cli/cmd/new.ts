import fs from 'fs'
import { confirm, input } from '@inquirer/prompts'
import { QUARTZ, QUARTZ_CONFIG_NAME, getQuartzPath, templateQuartzFolder } from '../config'
import chalk from 'chalk'
import { ArgumentsCamelCase } from 'yargs'
import { InferredOptionTypes } from 'yargs'
import { commonFlags } from './flags'
import { version } from '../package.json'
import path from 'path'
import { globby } from 'globby'
import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import { Spinner } from 'cli-spinner'
const exec = promisify(execCb)

const TEMPLATE_WELCOME_MD = `
# Welcome to Quartz

> “[One] who works with the door open gets all kinds of interruptions, but [they] also occasionally gets clues as to what the world is and what might be important.” — Richard Hamming

Quartz is a set of tools that helps you publish your [digital garden](https://jzhao.xyz/posts/networked-thought) and notes as a website for free.

## Configuration

🔗 Read the documentation and setup instructions: https://quartz.jzhao.xyz/

[Join the Discord Community](https://discord.gg/cRFFHYye7t)
`

export const SetupArgv = {
  ...commonFlags
}

export async function setupQuartz(argv: ArgumentsCamelCase<InferredOptionTypes<typeof SetupArgv>>) {
  const quartzPath = getQuartzPath(argv.directory)
  if (fs.existsSync(quartzPath)) {
    const answer = await confirm({ message: `A Quartz folder \`${quartzPath}\` already exists in this directory. Overwrite it?` })

    if (answer === false) {
      return
    }
  }

  const name = await input({ message: `Your name ${chalk.grey("(for author attribution and footer)")}:` })
  const hydrateInteractiveComponents = await confirm({ message: `Enable interactivity in custom components? ${chalk.grey("(this enables React hydration but may increase build times and bundle size)")}:` })

  await templateQuartzFolder(argv.directory, {
    quartzVersion: version,
    name,
    hydrateInteractiveComponents
  })

  const markdownFiles = await globby('**/*.md', {
    cwd: argv.directory,
    ignore: ['quartz/**'],
    gitignore: true,
  })

  // write a default file if there is no content
  if (markdownFiles.length === 0) {
    await fs.promises.writeFile(path.join(argv.directory, "index.md"), TEMPLATE_WELCOME_MD)
    console.log(chalk.grey(`Didn't find any existing Markdown content files in \`${argv.directory}\` so created a little welcome page :)`))
  }

  console.log(`${chalk.green("Successfully initialized Quartz")} (wrote configuration and template files to ${quartzPath})`)
  console.log(`hint: You can find more advanced configuration options in \`${QUARTZ + path.sep + QUARTZ_CONFIG_NAME}\``)
  
  const answer = await confirm({ message: "Would you like to install the dependencies for this Quartz? (runs \`npm i\`)" })
  if (answer) {
    const spinner = new Spinner("Installing dependencies... %s")
    spinner.setSpinnerString(18)
    spinner.start()
    await exec('npm i', {
      cwd: quartzPath
    })
    spinner.stop(true)
    console.log("Installing dependencies... " + chalk.green("ok"))
  }
}
