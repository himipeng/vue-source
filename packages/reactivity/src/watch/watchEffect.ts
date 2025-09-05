import doWatch, { type WatchOptions } from './doWatch'

export function watchEffect(effect: Function, options?: WatchOptions) {
  return doWatch(effect, null, options)
}

