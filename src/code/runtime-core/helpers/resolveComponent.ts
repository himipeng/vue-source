import type { ComponentOptions, ComponentPublicInstance } from '@/types/runtime-core'

/**
 * 运行时 helper，用于根据组件名解析组件实例
 * @param name 组件名
 * @param ctx 当前渲染上下文（通常是组件实例的 proxy 或 setup context）源码使用currentInstance全局变量
 * @returns 返回组件配置对象
 */
export function resolveComponent(name: string, ctx: ComponentPublicInstance): ComponentOptions | undefined {
  if (!ctx) return undefined

  // 内部实例
  const instance = ctx.$

  // 1. 优先从局部 components 查找
  if (instance.components && instance.components[name]) {
    return instance.components[name]
  }

  // 2. 全局组件
  if (instance.appContext && instance.appContext.components && instance.appContext.components[name]) {
    return instance.appContext.components[name]
  }

  // 3. 其他内置组件或特殊处理
  // TODO: Teleport, KeepAlive, Transition 等
  return undefined
}
