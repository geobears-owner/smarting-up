import { resolveToRoot } from "../path"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

function PageTitle({ fileData, cfg }: QuartzComponentProps) {
  const title = cfg?.pageTitle ?? "Untitled Quartz"
  const slug = fileData.slug!
  const baseDir = resolveToRoot(slug)
  return <h1 class="page-title"><a href={baseDir}>{title}</a></h1>
}

PageTitle.css = `
.page-title {
  margin: 0;
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
