import { PluggableList } from 'unified'
import { StaticResources, ProcessedContent, ValidComponentName, ComponentTypes } from "@jackyzha0/quartz-lib/types"
import { Data as VFileData } from 'vfile'
import { ComponentProps } from 'preact'

export type Data = VFileData

export abstract class QuartzTransformerPlugin {
  abstract name: string
  abstract markdownPlugins(): PluggableList
  abstract htmlPlugins(): PluggableList
  externalResources?: Partial<StaticResources>
}

export abstract class QuartzFilterPlugin {
  abstract name: string
  abstract shouldPublish(content: ProcessedContent<Data>): boolean
}

export abstract class QuartzEmitterPlugin {
  abstract name: string
  abstract emit(content: ProcessedContent<Data>[], actions: Actions): Promise<string[]>
}

export interface BuildPageOptions<T extends ValidComponentName<Data>> {
  // meta
  title: string
  description: string
  slug: string
  ext: `${string}.${string}`
  
  // hydration related
  componentName: T
  props: ComponentProps<ComponentTypes<Data>[T]>
}

export type Actions = {
  buildPage: <T extends ValidComponentName<Data>>(opts: BuildPageOptions<T>) => Promise<string>
}

export interface PluginTypes {
  transformers: QuartzTransformerPlugin[],
  filters: QuartzFilterPlugin[],
  emitters: QuartzEmitterPlugin[],
}

export type TypedComponent<T extends ValidComponentName<Data>> = ComponentTypes<Data>[T]

declare module 'vfile' {
  // inserted in processors.ts
  interface DataMap {
    slug: string
    filePath: string
  }
}

