import { ReactiveEffect } from '../effect'

/**
 * Dep 依赖管理器
 * 每个响应式属性都会对应一个 Dep，管理它的订阅者 (effect)
 */
export class Dep {
  /** 当前 dep 的版本号（触发 trigger 时递增） */
  version = 0

  /** 关联的 computed（如果有的话） */
  // TODO: 处理 ComputedRefImpl
  // computed?: ComputedRefImpl

  /** 保存订阅该 dep 的 effects */
  // TODO: 源码为链表结构：能更高效地维护 effect 访问顺序，避免重复遍历
  subs: Set<ReactiveEffect> = new Set()

  constructor() {}

  /**
   * 收集依赖
   */
  track() {
    // 如果没有激活的 effect，或者禁止追踪，则不收集
    if (!ReactiveEffect.activeEffect) {
      return
    }

    // 将当前 effect 添加到 dep.subs
    if (!this.subs.has(ReactiveEffect.activeEffect)) {
      this.subs.add(ReactiveEffect.activeEffect)
      // 同时反向记录 dep 到 effect 的依赖表
      if (!ReactiveEffect.activeEffect.deps.includes(this)) {
        ReactiveEffect.activeEffect.deps.push(this)
      }
    }
  }

  /**
   * 触发依赖更新
   */
  trigger() {
    this.version++

    const effectsToRun = new Set<ReactiveEffect>()

    // 收集所有订阅者（避免在运行时修改 set 导致死循环）
    this.subs.forEach((effect) => {
      if (effect !== ReactiveEffect.activeEffect) {
        effectsToRun.add(effect)
      }
    })

    // 逐个执行订阅者
    effectsToRun.forEach((effect) => {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    })
  }
}
