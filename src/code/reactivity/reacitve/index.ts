import { isObject } from '../utils'
import { MutableReactiveHandler, type Target } from './MutableReactiveHandler'

/** 用于缓存响应式对象，避免重复创建 */
export const reactiveMap = new WeakMap<object, any>()

// TODO: 暂不处理 shallow 和 readonly
export function reactive<T extends object>(target: T): T {
  if (!isObject(target)) return target

  // 已经被代理过的对象直接返回缓存
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) return existingProxy

  // 创建一个新的代理对象
  // TODO: 源码区分 普通对象/数组: baseHandlers , 集合类对象如Map/Set: collectionHandlers
  // Map/Set 的 .get()、.set()、.delete() 不是普通的属性访问，Vue 会重写方法
  const handler: ProxyHandler<Target> = new MutableReactiveHandler()
  const proxy = new Proxy(target, handler)

  // 缓存代理对象
  reactiveMap.set(target, proxy)

  return proxy
}

export function toReactive(value: any) {
  return isObject(value) ? reactive(value) : value
}
