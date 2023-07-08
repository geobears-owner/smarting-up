/** @type {import("@jackyzha0/quartz-plugins").TypedComponent<"pageList">} */
export default function({ pagesData }) {
  return <div>
    <ul>
      {pagesData.map((pageData) => <li>
        <a href={pageData.slug}>{pageData.frontmatter?.title}</a>
      </li>)}
    </ul>
  </div>
}
