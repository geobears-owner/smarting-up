import path from 'path'
import { slug } from 'github-slugger'

export function resolveToRoot(fp: string): string {
  const newPath = fp
    .split('/')
    .filter(x => x !== '')
    .map(_ => '..')
    .join('/')
  return newPath 
}


// mostly from https://github.com/withastro/astro/blob/dc31b8a722136eff90a600380a6419a37808d614/packages/astro/src/content/utils.ts#L213
export function slugify(fpWithAnchor: string): string {
  const [fp, anchor] = fpWithAnchor.split("#", 2)
  const sluggedAnchor = anchor === undefined ? "" : "#" + slug(anchor)
  const withoutFileExt = fp.replace(new RegExp(path.extname(fp) + '$'), '')
  const rawSlugSegments = withoutFileExt.split(path.sep)
  const slugParts: string = rawSlugSegments
    .map((segment) => slug(segment))
    .join(path.posix.sep)
    .replace(/index$/, '')
    .replace(/\/$/, '')
  return path.normalize(slugParts) + sluggedAnchor
}

export function slugFromPath(dir: string, fullPath: string): string {
  const fullDir = path.join(dir, "content")
  return slugify(path.relative(fullDir, fullPath))
}

export function relativeToRoot(slug: string, fp: string): string {
  return path.join(resolveToRoot(slug), fp)
}

export function relative(src: string, dest: string): string {
  return path.relative(src, dest)
}

export function isAbsolute(fp: string): boolean {
  return path.isAbsolute(fp)
}
