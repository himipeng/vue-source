/**
 * 全局副作用调度队列
 * 存储待执行的副作用函数
 * 使用微任务进行统一调度，避免重复执行
 */
const queue: Function[] = []

/** 当前 flush 的 Promise 对象，用于防止重复调度 */
let currentFlushPromise: Promise<void> | null = null

/** 当前正在执行队列的位置索引 */
let flushIndex = -1

/**
 * 调度队列执行
 * 如果当前没有 flush 正在进行，则通过微任务调度 flushJobs
 */
function queueFlush() {
  if (!currentFlushPromise) {
    // 将 flushJobs 放入微任务队列，保证本轮事件循环结束后执行
    currentFlushPromise = Promise.resolve().then(flushJobs)

    // 可选方案：宏任务（优先级低，会有延迟）
    // currentFlushPromise = setTimeout(flushJobs, 0)
  }
}

/**
 * 执行队列中的所有副作用任务
 * @remarks
 * 1. 遍历 queue 执行每个 ReactiveEffect 的 run 方法
 * 2. 执行完成后重置状态，清空队列
 */
function flushJobs() {
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      if (job) {
        job()
      }
    }
  } finally {
    // 重置索引，标记当前 flush 完成
    flushIndex = -1
    currentFlushPromise = null
    queue.length = 0 // 清空队列
  }
}

/**
 * 将一个副作用任务加入调度队列
 * @param job - 待调度的 ReactiveEffect
 * @remarks
 * 1. 使用 includes 去重，避免同一 effect 在同一轮循环中重复执行
 * 2. 调用 queueFlush，将 flushJobs 放入微任务队列
 */
export function queueJob(job: Function) {
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}
