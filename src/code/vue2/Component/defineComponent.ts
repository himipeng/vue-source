import type { ComponentOptions } from '.'

/** 返回配置对象而非实例 */
function defineComponent(options: ComponentOptions): ComponentOptions {
  return options
}

export default defineComponent
