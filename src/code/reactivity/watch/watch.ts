import doWatch, { type Cb, type Source, type WatchOptions } from './doWatch'

export function watch(source: Source, cb: Cb, options?: WatchOptions) {
  return doWatch(source, cb, options)
}
