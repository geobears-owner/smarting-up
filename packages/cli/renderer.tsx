import { Actions } from "@jackyzha0/quartz-plugins/types"
import { render } from 'preact-render-to-string'
import { QuartzConfig } from "./config"
import { StaticResources } from '@jackyzha0/quartz-lib/types'
import path from 'path'
import fs from 'fs'
import { HYDRATION_SCRIPT } from './hydration'
import { h } from 'preact'
import { resolveToRoot } from '@jackyzha0/quartz-lib'

export function createBuildPageAction(outputDirectory: string, cfg: QuartzConfig, staticResources: StaticResources): Actions["buildPage"] {
  return async ({ slug, ext, title, description, componentName, props }) => {
    const hydrationData = cfg.configuration.hydrateInteractiveComponents
      ? h("script", {
        id: "__QUARTZ_HYDRATION_DATA__", type: "application/quartz-data", dangerouslySetInnerHTML: {
          __html: JSON.stringify({
            props,
            componentName
          })
        }
      })

      : null

    const pathToRoot = resolveToRoot(slug)
    const resources = { ...staticResources }
    if (cfg.configuration.hydrateInteractiveComponents) {
      resources.js.push({
        src: path.join(pathToRoot, HYDRATION_SCRIPT),
        loadTime: 'afterDOMReady'
      })
    }

    const Head = cfg.components.head
    const Component = cfg.components[componentName]

    const doc = h(
      "html",
      { id: "quartz-root" },
      h(Head, { title, description, baseDir: pathToRoot, externalResources: resources }),
      h("body", { id: "quartz-body" },
        h(Component, props as any),
        hydrationData,
        ...resources.js.filter(resource => resource.loadTime === "afterDOMReady").map((resource) => h("script", { key: resource.src, src: resource.src }))
      ),
    )

    const pathToPage = path.join(outputDirectory, slug + ext)
    const dir = path.dirname(pathToPage)
    await fs.promises.mkdir(dir, { recursive: true })
    await fs.promises.writeFile(pathToPage, "<!DOCTYPE html>\n" + render(doc))
    return pathToPage
  }
}
