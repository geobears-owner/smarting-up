import { ProcessedContent } from "@jackyzha0/quartz-lib/types"
import { Actions, Data, QuartzEmitterPlugin } from "../types"

export class ContentIndex extends QuartzEmitterPlugin {
  name = "ContentIndex"
  async emit(content: ProcessedContent<Data>[], actions: Actions): Promise<string[]> {
    const fps: string[] = []
    for (const [tree, file] of content) {
    }
    return fps
  }
}
