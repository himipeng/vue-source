import type { ComponentOptions } from '../types'

/** 返回配置对象而非实例 */
export function defineComponent<Props extends Record<string, any>>(
  options: ComponentOptions<Props>
): ComponentOptions<Props> {
  return { ...options }
}
