// ReactiveEffect 是 Vue 3 响应式系统中的 核心类
// 它表示一个“副作用函数”（effect），即在数据变化时需要重新执行的逻辑。
// 可以把它看作是 Vue 2 中 Watcher 的替代品，但更轻量、更灵活、且支持嵌套、调度器等高级功能。

import type { Dep } from '../dep'
import { batch } from './batch'
import { EffectFlags } from './effectFlags'

/** 当前活跃的副作用 */
// TODO: vue 3.5+ 依赖收集重构，activeEffect 更改为 activeSub（Subscriber）
export let activeEffect: ReactiveEffect | null = null

/**
 * Vue 响应式系统中的“观察者”（Observer）
 * - 通过 fn 表示副作用逻辑
 * - 依赖响应式数据，当数据变化时被重新调度执行
 */
export class ReactiveEffect<T = any> {
  /** 记录当前这个 effect 被哪些响应式属性的 dep（依赖集合）引用了，用于在 stop() 或更新时清理依赖关系 */
  // 双向追踪，反向记录
  /* 
  Vue 3 的响应式系统中：
	•	dep (Set<effect>)：被观察对象记录所有观察者
	•	effect.deps (Dep[])：观察者反过来记录自己在哪些对象中被追踪（用于清理）
  二者配合，构成了可追踪 + 可解绑的响应系统，比 Vue 2 更高效可靠。
  */
  public deps: Dep[] = []

  /** 位标志，用于表示 effect 的状态、行为和生命周期 */
  public flags: EffectFlags = EffectFlags.ACTIVE | EffectFlags.TRACKING

  /** effect 的“更新调度器”。如果有，它接管 effect 的执行逻辑；如果没有，effect 默认立即运行。 */
  public scheduler?: (...args: any[]) => any

  constructor(public fn: () => T) {}

  /**
   * 执行副作用函数并收集依赖
   * - 如果已经 stop，则只执行 fn，不进行依赖收集
   * - 如果仍处于 active 状态，则：
   *   1. 清理旧依赖
   *   2. 切换 activeEffect
   *   3. 执行 fn（触发响应式读取，从而建立新的依赖关系）
   *   4. 恢复 activeEffect
   */
  run() {
    if (!(this.flags & EffectFlags.ACTIVE)) {
      // 如果 effect 已经被 stop 掉，直接执行一次 fn，不参与响应式追踪
      return this.fn()
    }
    // 依赖切换前先清理旧的依赖
    /* 例子(不清理的后果)
      const effect = new ReactiveEffect(() => {
        console.log(flag.value ? count.value : 'no count')
      })
      */
    cleanupEffect(this)

    // 依赖收集
    const prevEffect = activeEffect
    activeEffect = this

    try {
      // 执行副作用函数，并触发函数中响应性数据的依赖收集
      return this.fn()
    } finally {
      // 清除依赖
      activeEffect = prevEffect
    }
  }

  /**
   * 停止 effect，使其不再收集依赖并参与更新
   */
  stop() {
    if (this.flags & EffectFlags.ACTIVE) {
      cleanupEffect(this)
      this.flags &= ~EffectFlags.ACTIVE
    }
  }

  /**
   * 触发副作用函数的重新执行
   */
  trigger() {
    if (this.scheduler) {
      this.scheduler()
    } else {
      this.run()
    }
  }

  /**
   * 响应式依赖通知时调用（批处理队列）
   */
  notify() {
    if (this.flags & EffectFlags.RUNNING && !(this.flags & EffectFlags.ALLOW_RECURSE)) {
      return
    }
    if (!(this.flags & EffectFlags.NOTIFIED)) {
      batch(this)
    }
  }
}

/**
 * 清理 effect 的所有依赖
 */
function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].subs.delete(effect)
  }
  effect.deps.length = 0
}
