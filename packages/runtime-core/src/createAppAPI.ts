import type { AppContext } from './types'

/**
 * 创建应用上下文实例
 */
export function createAppContext(): AppContext {
  return {
    app: null as any,
    mixins: [],
    components: {},
    provides: Object.create(null),
  }
}
