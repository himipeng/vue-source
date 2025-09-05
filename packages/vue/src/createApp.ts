import { createApp as baseCreateApp, type App, type ComponentOptions } from '@vue/runtime-dom'
import { compileToFunction } from './compileToFunction'

/**
 * 完整构建版 (full build) 的 createApp
 *
 * - 基于 runtime-dom 的 createApp
 * - 增强点：如果组件只有 template 而没有 render，会在挂载前调用 compileToFunction 把 template 编译成 render
 *
 * @param rootComponent 根组件配置对象（ComponentOptions）
 * @returns 应用实例 (App)
 */
export const createApp = (rootComponent: ComponentOptions): App => {
  // 基于 runtime-dom 创建应用
  const app = baseCreateApp(rootComponent)

  // 缓存原始的 mount 方法
  const mount = app.mount

  // 重写 mount：在挂载前检查是否需要编译 template
  app.mount = (container) => {
    const component = rootComponent

    // 如果用户只写了 template，没有提供 render
    if (!component.render && component.template) {
      // 编译 template → render 函数
      component.render = compileToFunction(component.template)
    }

    // 调用原始的 mount 逻辑
    return mount(container)
  }

  return app
}
