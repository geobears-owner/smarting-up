import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"

export const ContentPage: QuartzEmitterPlugin<FullPageLayout> = (opts) => {
  if (!opts) {
    throw new Error("ContentPage must be initialized with options specifiying the components to use")
  }

  const { head: Head, header, beforeBody, pageBody: Content, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "ContentPage",
    getQuartzComponents() {
      return [Head, Header, Body, ...header, ...beforeBody, Content, ...left, ...right, Footer]
    },
    async emit(_contentDir, cfg, content, resources, emit): Promise<string[]> {
      const fps: string[] = []
      const allFiles = content.map(c => c[1].data)
      for (const [tree, file] of content) {
        const slug = file.data.slug!
        const externalResources = pageResources(slug, resources)
        const componentData: QuartzComponentProps = {
          fileData: file.data,
          externalResources,
          cfg,
          children: [],
          tree,
          allFiles
        }

        const content = renderPage(
          slug,
          componentData,
          opts,
          externalResources
        )

        const fp = file.data.slug + ".html"
        await emit({
          content,
          slug: file.data.slug!,
          ext: ".html",
        })

        fps.push(fp)
      }
      return fps
    }
  }
}
