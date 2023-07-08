import { ProcessedContent } from "@jackyzha0/quartz-lib/types"
import { Data, QuartzFilterPlugin } from "../types"

export class RemoveDrafts extends QuartzFilterPlugin {
  name = "RemoveDrafts"
  shouldPublish([_tree, vfile]: ProcessedContent<Data>): boolean {
    const draftFlag: boolean = vfile.data?.frontmatter?.draft ?? false
    return !draftFlag
  }
}
