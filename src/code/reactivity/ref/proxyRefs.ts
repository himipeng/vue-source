import { isRef } from '../utils'

/**
 * 实现 Vue3 的 proxyRefs（ref.value 自动脱壳）
 */
export function proxyRefs(obj: any) {
  return new Proxy(obj, {
    get(target, key) {
      const val = target[key]
      // 如果是 ref，就自动返回 .value
      return isRef(val) ? val.value : val
    },
    set(target, key, newVal) {
      const oldVal = target[key]
      // 如果旧值是 ref，更新 .value，否则直接替换
      if (isRef(oldVal)) {
        oldVal.value = newVal
        return true
      } else {
        return Reflect.set(target, key, newVal)
      }
    },
  })
}
