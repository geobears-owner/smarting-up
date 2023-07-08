import { Node } from 'hast'
import { Data as BaseData, VFile } from 'vfile/lib'
import { RenderableProps, VNode } from 'preact'

export interface JSResource {
  src: string
  loadTime: 'beforeDOMReady' | 'afterDOMReady'
}

export interface StaticResources {
  css: string[],
  js: JSResource[]
}

export type ProcessedContent<Data extends BaseData> = [Node<Data>, VFile]
export type ValidComponentName<Data extends BaseData> = keyof ComponentTypes<Data>
export type FunctionComponent<P> = (props: RenderableProps<P>) => VNode<P>
export type ComponentTypes<Data extends BaseData> = {
  pageSingle: FunctionComponent<{
    pageData: Data,
    articleAstNode: Node<Data>
  }>,
  pageList: FunctionComponent<{
    listName: string,
    description: string,
    pagesData: Data[],
  }>
  pageHome: ComponentTypes<Data>["pageSingle"],
  head: FunctionComponent<{
    title: string,
    description: string,
    externalResources: StaticResources
    baseDir: string
  }>
}
