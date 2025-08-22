import type ReactiveEffect from '../effect/ReactiveEffect'

export type Dep = Set<ReactiveEffect>

export const createDep = (effects?: ReactiveEffect[]): Dep => {
  const dep = new Set<ReactiveEffect>(effects)
  return dep
}
