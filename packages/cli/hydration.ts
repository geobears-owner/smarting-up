import fs from 'fs'
import esbuild from 'esbuild'
import { getQuartzPath } from './config'

const hydrationScriptContent = `
import { h, hydrate } from 'preact'
import cfg from './quartz.config.js'

const hydrationDataNode = document.getElementById('__QUARTZ_HYDRATION_DATA__')
const { props, componentName} = JSON.parse(hydrationDataNode.innerText)
const component = cfg.components[componentName]
const element = h(component, props)
const domNode = document.getElementById('quartz-body')
hydrate(element, domNode)
`

export const HYDRATION_SCRIPT = "hydration.js"
export async function transpileHydrationScript(inputDirectory: string, outfile: string) {
  return esbuild.build({
    stdin: {
      contents: hydrationScriptContent,
      resolveDir: getQuartzPath(inputDirectory),
    },
    bundle: true,
    keepNames: true,
    minify: true,
    metafile: true,
    platform: "browser",
    outfile,
    logLevel: 'error',
    // treeshaking plugin imports doesn't seem to work: https://github.com/evanw/esbuild/issues/1794
    plugins: [{
      name: "quartz-plugin-shim",
      setup(build) {
        build.onLoad({ filter: /.\/quartz.config.js/ }, async args => {
          const source = await fs.promises.readFile(args.path, "utf8")
          let strippedSource = source
            .replace(/^import \{.+\} from '@jackyzha0\/quartz-plugins(\/.+)?'/, '')
            .replace(/new .+\([\s\S]*?\)/g, 'undefined')
          return {
            contents: strippedSource,
            loader: 'js'
          }
        })
      },
    }]
  })
}
