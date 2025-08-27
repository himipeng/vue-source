import ComputedRefImpl, { type ComputedConfig } from './computedRefImpl'

export function computed<T>(config: ComputedConfig<T>) {
  return new ComputedRefImpl(config)
}
