import type { ComponentOptions } from '@vue/types/runtime-core'

/** 返回配置对象而非实例 */
export function defineComponent(options: ComponentOptions): ComponentOptions {
  return { ...options }
}
