import type { ComponentOptions } from '@/types/runtime-core'

/** 返回配置对象而非实例 */
function defineComponent(options: ComponentOptions): ComponentOptions {
  return { $type: 'vue3', ...options }
}

export default defineComponent
