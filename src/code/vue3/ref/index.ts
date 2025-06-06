import RefImpl from './refImpl'
import { isRef } from '../utils'

function createRef<T>(rawValue: T) {
  if (isRef(rawValue)) {
    return rawValue as unknown as RefImpl<T>
  }
  return new RefImpl<T>(rawValue)
}

export function ref<T>(value: T) {
  return createRef<T>(value)
}
