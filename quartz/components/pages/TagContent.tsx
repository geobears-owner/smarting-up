import { QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { Fragment, jsx, jsxs } from 'preact/jsx-runtime'
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import style from '../styles/listPage.scss'
import { PageList } from "../PageList"
import { clientSideSlug } from "../../path"

function TagContent(props: QuartzComponentProps) {
  const { tree, fileData, allFiles } = props
  const slug = fileData.slug

  if (slug?.startsWith("tags/")) {
    const tag = clientSideSlug(slug.slice("tags/".length))
    const allPagesWithTag = allFiles.filter(file => (file.frontmatter?.tags ?? []).includes(tag))
    const listProps = {
      ...props,
      allFiles: allPagesWithTag
    }

    const desc = props.fileData.description

    // @ts-ignore
    const content = toJsxRuntime(tree, { Fragment, jsx, jsxs, elementAttributeNameCase: 'html' })
    return <div class="popover-hint">
      {desc && <p>{desc}</p>}
      <article>{content}</article>
      <p>{allPagesWithTag.length} items with this tag.</p>
      <div>
        <PageList {...listProps} />
      </div>
    </div>
  } else {
    throw `Component "TagContent" tried to render a non-tag page: ${slug}`
  }
}

TagContent.css = style + PageList.css
export default (() => TagContent) satisfies QuartzComponentConstructor
