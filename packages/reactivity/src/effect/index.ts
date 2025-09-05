import { ReactiveEffect } from './ReactiveEffect'

/**
 * 注册副作用函数，并立即执行一次，触发依赖收集
 */
export function effect(fn: () => void) {
  const eff = new ReactiveEffect(fn)
  eff.run()
  return eff
}

export * from './ReactiveEffect'
export * from './batch'
