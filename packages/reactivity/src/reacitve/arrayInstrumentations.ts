import { endBatch, pauseTracking, resetTracking, startBatch } from '../effect'
import { toRaw } from '../utils'

// Array 方法改写
// 1.只读方法的修复: include 等方法的依赖收集
// 2.修改方法的优化: push、pop 等方法暂停依赖收集，保护依赖收集不被污染
export const arrayInstrumentations: Record<string | symbol, Function> = <any>{
  __proto__: null,

  push(...args: unknown[]) {
    return noTracking(this, 'push', args)
  },

  // TODO: 其他方法的改写
}

// 数组的原生方法（push、pop、shift、unshift 等）内部会读写 length 或访问数组索引
// 改写数组方法 主要目的是防止内部访问 length 或索引时收集依赖，保护依赖收集不被污染，不是为了触发响应式更新
// 这点和 Vue2 不一样（Proxy 可以拦截数组索引和 length 的操作，而 Object.defineProperty 不行）
// 触发更新（trigger）是 在 set / add / delete 里完成的，即数组真实修改索引或 length 时才触发
function noTracking(self: unknown[], method: keyof Array<any>, args: unknown[] = []) {
  // 暂停依赖收集，防止方法内部访问 length 或索引时触发错误的依赖
  pauseTracking()
  startBatch()
  const res = (toRaw(self) as any)[method].apply(self, args)
  endBatch()
  resetTracking()
  return res
}
