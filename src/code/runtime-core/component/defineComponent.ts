import type { ComponentOptions } from '@vue/types/runtime-core'

/** 返回配置对象而非实例 */
export function defineComponent<Props extends Record<string, any>>(
  options: ComponentOptions<Props>
): ComponentOptions<Props> {
  return { ...options }
}
