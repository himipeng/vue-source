import doWatch, { type WatchOptions } from './doWatch'

function watchEffect(effect: Function, options?: WatchOptions) {
  return doWatch(effect, null, options)
}

export default watchEffect
