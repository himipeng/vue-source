import { getCurrentInstance } from '../component'
import type { InjectionKey, Provides } from '@vue/reactivity/src/types'

/**
 * 提供依赖
 * @param key 唯一 key
 * @param value 提供的值
 */
export function provide<T>(key: InjectionKey, value: T): void {
  const instance = getCurrentInstance()

  if (!instance) {
    console.warn('provide() 只能在 setup() 或组件初始化时调用')
    return
  }

  let provides = instance.provides
  const parentProvides = instance.parent?.provides

  // 如果 provides 还是继承自父级，先独立化
  if (provides === parentProvides) {
    // 以父级 provides 为原型构建自己的 provides
    provides = instance.provides = Object.create(parentProvides)
  }

  provides[key] = value
}

/**
 * 注入依赖
 * @param key 唯一 key
 * @param defaultValue 默认值（可选）暂不实现
 * @returns 注入的值或默认值
 */
export function inject<T = any>(key: InjectionKey, defaultValue?: T): T | undefined {
  const instance = getCurrentInstance()

  // 不处理 currentApp、app.runWithContext()
  if (!instance) {
    console.warn('inject() 只能在 setup() 调用')
    return
  }

  let provides: Provides<T> | undefined
  // 先查组件 provides（通过原型链可向上查父组件）
  if (instance.parent) {
    provides = instance.parent.provides
  }
  // fallback 到 app.provide
  else if (instance.vnode.appContext) {
    provides = instance.vnode.appContext.provides
  } else {
    provides = undefined
  }

  if (provides && key in provides) {
    return provides[key]
  } else if (defaultValue !== undefined) {
    return defaultValue
  } else {
    console.warn(`injection "${String(key)}" not found.`)
  }
}
