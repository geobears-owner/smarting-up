import { ProcessedContent } from "@jackyzha0/quartz-lib/types"
import { Actions, Data, QuartzEmitterPlugin } from "../types"

export class ContentPage extends QuartzEmitterPlugin {
  name = "ContentPage"
  async emit(content: ProcessedContent<Data>[], actions: Actions): Promise<string[]> {
    const fps: string[] = []
    for (const [tree, file] of content) {
      const fp = await actions.buildPage({
        title: file.data.frontmatter?.title ?? "Untitled",
        description: file.data.description ?? "",
        slug: file.data.slug!,
        componentName: file.data.slug === "/index" ? "pageHome" : "pageSingle",
        ext: ".html",
        props: {
          pageData: file.data,
          articleAstNode: tree
        }
      })

      // process aliases
      let aliases: string[] = []
      if (file.data.frontmatter?.alias) {
        aliases.push(file.data.frontmatter.alias as string)
      } else if (file.data.frontmatter?.aliases) {
        aliases.push(...file.data.frontmatter.aliases as string[])
      }

      fps.push(fp)
    }
    return fps
  }
}
