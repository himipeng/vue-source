import type { ComponentOptions, ComponentPublicInstance } from '@vue/types/runtime-core'
import { camelize, capitalize } from '@vue/utils'

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

  const Component =
    // 1. 优先从局部 components 查找
    resolve(instance.components, name) ||
    // 2. 全局组件
    resolve(instance.appContext?.components, name)

  // 3. 其他内置组件或特殊处理
  // TODO: Teleport, KeepAlive, Transition 等

  if (Component) {
    return Component
  } else {
    // 无法解析组件
    console.warn(`Failed to resolve <${name}>`)
    return undefined
  }
}

function resolve(registry: Record<string, ComponentOptions> | undefined | null, name: string) {
  // 标准化名称
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))])
}
