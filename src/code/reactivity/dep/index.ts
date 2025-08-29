import { activeEffect, endBatch, ReactiveEffect, shouldTrack, startBatch } from '../effect'

export type DebuggerEventExtraInfo = {
  target: object
  type: 'track' | 'trigger'
  key: any
  newValue?: any
  oldValue?: any
  oldTarget?: Map<any, any> | Set<any>
}

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
  // TODO: 源码 Vue 3.4+ 换成了双向链表结构：能更高效地维护 effect 访问顺序，避免重复遍历
  subs: Set<ReactiveEffect> = new Set()

  constructor() {}

  /**
   * 收集依赖
   */
  track(debugInfo?: DebuggerEventExtraInfo) {
    // 如果没有激活的 effect，或者禁止追踪，则不收集
    if (!activeEffect || !shouldTrack) {
      return
    }

    // 将当前 effect 添加到 dep.subs
    if (!this.subs.has(activeEffect)) {
      debugInfo && console.log('[Dep track]', debugInfo)

      this.subs.add(activeEffect)
      // 同时反向记录 dep 到 effect 的依赖表
      if (!activeEffect.deps.includes(this)) {
        activeEffect.deps.push(this)
      }
    }
  }

  /**
   * 触发依赖更新
   */
  trigger(debugInfo?: DebuggerEventExtraInfo) {
    this.version++
    this.notify(debugInfo)
  }

  notify(debugInfo?: DebuggerEventExtraInfo): void {
    startBatch()
    try {
      const effectsToRun = new Set<ReactiveEffect>()

      // 收集所有订阅者（避免在运行时修改 set 导致死循环）
      this.subs.forEach((effect) => {
        if (effect !== activeEffect) {
          effectsToRun.add(effect)
        }
      })

      // 逐个执行订阅者
      effectsToRun.forEach((effect) => {
        debugInfo && console.log('[Dep trigger]', debugInfo)
        effect.notify()
      })
    } finally {
      endBatch()
    }
  }
}
