import type ReactiveEffect from './reactiveEffect'

export type Dep = Set<ReactiveEffect>

export const createDep = (effects?: ReactiveEffect[]): Dep => {
  const dep = new Set<ReactiveEffect>(effects)
  return dep
}
