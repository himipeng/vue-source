import { isFunction } from '@vue/utils'
import {
  ComputedRefImpl,
  type ComputedGetter,
  type ComputedSetter,
  type ComputedOptions,
} from './computedRefImpl'

export function computed<T>(getter: ComputedGetter<T>): ComputedRefImpl<T>
export function computed<T>(config: ComputedOptions<T>): ComputedRefImpl<T>
export function computed<T>(getterOrOptions: ComputedGetter<T> | ComputedOptions<T>) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T> | undefined

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter)
}

export { ComputedRefImpl as ComputedRef }
