/**
 * ReactiveEffect 内部使用的位标志（Bit Flags），用于表示 effect 的状态、行为和生命周期。
 *
 * 每个标志占用一位，可以通过按位运算组合使用。
 */
export enum EffectFlags {
  /**
   * effect 当前处于激活状态，可以收集依赖并被触发。
   *
   * 当不处于 ACTIVE 状态时，effect 被视为已停止，不会追踪依赖。
   */
  ACTIVE = 1 << 0,

  /**
   * effect 当前正在运行中。
   *
   * 用于避免 effect 在执行过程中递归触发自身。
   */
  RUNNING = 1 << 1,

  /**
   * effect 当前正在追踪依赖。
   *
   * 在响应式属性的 getter 执行期间设置，表示可以收集依赖。
   */
  TRACKING = 1 << 2,

  /**
   * effect 已经被通知，将在批量更新中执行。
   *
   * 用于防止同一个 effect 被多次加入 flush 队列。
   */
  NOTIFIED = 1 << 3,

  /**
   * effect 是脏的，需要重新计算。
   *
   * 主要用于 computed 属性，用于标记缓存的值已过期。
   */
  DIRTY = 1 << 4,

  /**
   * 允许 effect 自己递归触发自身。
   *
   * 通常用于某些场景下需要自触发的 watcher 回调。
   */
  ALLOW_RECURSE = 1 << 5,

  /**
   * effect 被暂停，不会被触发。
   *
   * 可以临时挂起 effect，而不完全停止它。
   */
  PAUSED = 1 << 6,

  /**
   * 标记 computed effect 至少已经被计算过一次。
   *
   * 用于区分尚未运行的 computed 与已缓存的结果。
   */
  EVALUATED = 1 << 7,
}
