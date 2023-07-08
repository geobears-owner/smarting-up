import { astToJsx } from "@jackyzha0/quartz-lib/jsx"

/** @type {import("@jackyzha0/quartz-plugins").TypedComponent<"pageSingle">} */
export default function({ pageData, articleAstNode }) {
  return <article>
    <h1>{pageData.frontmatter?.title}</h1>
    {astToJsx(articleAstNode)}
  </article>
}
