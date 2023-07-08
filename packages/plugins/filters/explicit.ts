import { ProcessedContent } from "@jackyzha0/quartz-lib/types"
import { Data, QuartzFilterPlugin } from "../types"

export class ExplicitPublish extends QuartzFilterPlugin {
  name = "ExplicitPublish"
  shouldPublish([_tree, vfile]: ProcessedContent<Data>): boolean {
    const publishFlag: boolean = vfile.data?.frontmatter?.publish ?? false
    return publishFlag
  }
}
