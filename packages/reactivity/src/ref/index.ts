import { RefImpl } from './RefImpl'
import { isRef } from '../utils'

function createRef<T>(rawValue?: T) {
  if (isRef(rawValue)) {
    return rawValue as unknown as RefImpl<T>
  }
  return new RefImpl<T>(rawValue)
}

export function ref<T>(value?: T) {
  return createRef<T>(value)
}

export function unref<T>(ref: RefImpl<T> | T): T {
  return isRef(ref) ? ref.value : ref
}

export { RefImpl as Ref }
export * from './proxyRefs'
