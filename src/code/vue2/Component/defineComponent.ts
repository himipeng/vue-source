import type { ComponentOptions } from '../types/component'

/** 返回配置对象而非实例 */
function defineComponent(options: ComponentOptions): ComponentOptions {
  return { $type: 'vue2', ...options }
}

export default defineComponent
