import { isObject } from '../utils'
import { track, trigger } from './targetMap'

/** 用于缓存响应式对象，避免重复创建 */
const reactiveMap = new WeakMap<object, any>()

function reactive<T extends object>(target: T): T {
  if (!isObject(target)) return target

  // 已经被代理过的对象直接返回缓存
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) return existingProxy

  // 创建一个新的代理对象
  const handler: ProxyHandler<T> = {
    get(target, key, receiver) {
      // 如果访问 __v_raw，返回原始对象
      if (key === '__v_raw') {
        return target
      }
      if (key === '__v_isRef') {
        return false
      }
      if (key === '__v_isReactive') {
        return true
      }

      const res = Reflect.get(target, key, receiver)
      track(target, key)

      // 递归响应式处理
      return isObject(res) ? reactive(res as object) : res
    },

    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (value !== oldValue) {
        trigger(target, key)
      }
      return result
    },
  }
  const proxy = new Proxy(target, handler)

  // 缓存代理对象
  reactiveMap.set(target, proxy)

  return proxy
}

export default reactive
