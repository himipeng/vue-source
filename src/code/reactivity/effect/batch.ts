import { EffectFlags } from './effectFlags'
import type { ReactiveEffect } from './ReactiveEffect'

/**
 * 当前批量更新的嵌套深度
 * 用于支持嵌套的 trigger 调用，如果 batchDepth > 0，则不会立即 flush
 */
let batchDepth = 0

/**
 * 同步批量执行队列
 * 存储所有被 NOTIFIED 标记的 ReactiveEffect，用于同步批量触发
 */
// TODO: Vue 3.5 后使用链表结构替代数组
let batchedSubs: ReactiveEffect[] = []

/**
 * 将 effect 加入批量队列
 * @param sub 要批量执行的 ReactiveEffect
 */
export function batch(sub: ReactiveEffect): void {
  // 标记该 effect 已经被通知，避免重复加入队列
  sub.flags |= EffectFlags.NOTIFIED

  // TODO: 暂不处理 computed effect
  // if (isComputed) {
  //   sub.next = batchedComputed
  //   batchedComputed = sub
  //   return
  // }

  // 将 effect 放入批量队列
  batchedSubs.push(sub)
}

/**
 * 开始批量更新
 * 每次 trigger 或 notify 时调用，增加 batchDepth
 * 支持嵌套 trigger 时延迟 flush
 */
export function startBatch() {
  batchDepth++
}

/**
 * 结束批量更新
 * 当所有嵌套 trigger 完成后，flush 批量队列
 * @remarks
 * 1. batchDepth > 1 表示还有外层 trigger 正在执行，不立即 flush
 * 2. 当 batchDepth 减为 0 时，按后进先出的顺序触发队列中的 effect
 * 3. 每个 effect 执行前会清除 NOTIFIED 标记
 */
export function endBatch(): void {
  // 如果还有外层 batch 正在进行，直接返回，延迟 flush
  if (--batchDepth > 0) {
    return
  }

  // TODO: 暂不处理 computed effect

  // 按后进先出触发队列中的 effect
  let batchedSub = batchedSubs.pop()
  while (batchedSub) {
    // 清除 NOTIFIED 标记，以便下次再次触发
    batchedSub.flags &= ~EffectFlags.NOTIFIED

    // 只有 ACTIVE 状态的 effect 才能被触发
    if (batchedSub.flags & EffectFlags.ACTIVE) {
      try {
        batchedSub.trigger()
      } catch (err) {
        throw err
      }
    }

    batchedSub = batchedSubs.pop()
  }
}
