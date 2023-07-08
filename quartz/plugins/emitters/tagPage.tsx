import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { ProcessedContent, defaultProcessedContent } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { clientSideSlug } from "../../path"

export const TagPage: QuartzEmitterPlugin<FullPageLayout> = (opts) => {
  if (!opts) {
    throw new Error("TagPage must be initialized with options specifiying the components to use")
  }

  const { head: Head, header, beforeBody, pageBody: Content, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "TagPage",
    getQuartzComponents() {
      return [Head, Header, Body, ...header, ...beforeBody, Content, ...left, ...right, Footer]
    },
    async emit(_contentDir, cfg, content, resources, emit): Promise<string[]> {
      const fps: string[] = []
      const allFiles = content.map(c => c[1].data)

      const tags: Set<string> = new Set(allFiles.flatMap(data => data.frontmatter?.tags ?? []))
      const tagDescriptions: Record<string, ProcessedContent> = Object.fromEntries([...tags].map(tag => ([
        tag, defaultProcessedContent({ slug: `tags/${tag}`, frontmatter: { title: `Tag: ${tag}`, tags: [] } })
      ])))

      for (const [tree, file] of content) {
        const slug = clientSideSlug(file.data.slug!)
        if (slug.startsWith("tags/")) {
          const tag = slug.slice("tags/".length)
          if (tags.has(tag)) {
            tagDescriptions[tag] = [tree, file]
          }
        }
      }

      for (const tag of tags) {
        const slug = `tags/${tag}`
        const externalResources = pageResources(slug, resources)
        const [tree, file] = tagDescriptions[tag]
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
