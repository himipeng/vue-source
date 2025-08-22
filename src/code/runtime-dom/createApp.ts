import { createRenderer } from '@vue/runtime-core/renderer'
import * as nodeOps from './nodeOps'
import type { ComponentOptions } from '@/types/runtime-core'
import { createVNode } from '@vue/runtime-core'
import { patchProp } from './patchProp'

/**
 * Vue App 实例接口
 */
export interface App<HostElement = Element> {
  /**
   * 挂载组件到宿主元素
   * @param rootContainer 宿主元素或选择器
   * @returns 挂载的根组件实例
   */
  mount(rootContainer: HostElement | string): /* ComponentPublicInstance */ any
  /**
   * 卸载应用
   */
  unmount(): void
  /**
   * 注册全局组件
   * @param name 组件名
   * @param component 组件选项
   */
  component(name: string, component: ComponentOptions): this
  /**
   * 注册全局指令
   * @param name 指令名
   * @param directive 指令定义
   */
  directive(name: string, directive: any): this
  /**
   * 使用插件
   * @param plugin 插件对象或函数
   * @param options 插件选项
   */
  use(plugin: any, ...options: any[]): this
  /**
   * 获取应用配置
   */
  config?: Record<string, any>
  /**
   * 挂载容器
   */
  _container: HostElement | null
}

const renderer = createRenderer({ ...nodeOps, patchProp })

/**
 * 创建应用实例
 * @param rootComponent 根组件
 * @returns App 实例，包含 mount、use 等方法
 */
export function createApp(rootComponent: ComponentOptions): App {
  const app: App = {
    _container: null,
    mount(rootContainer: Element | string) {
      // 获取真实 DOM 容器
      const container = typeof rootContainer === 'string' ? document.querySelector(rootContainer)! : rootContainer

      // 1. 创建根 vnode
      const vnode = createVNode(rootComponent)

      // 2. 调用 renderer 的 render
      renderer.render(vnode, container)

      // 3. 保存挂载容器
      app._container = container

      return vnode.component!.proxy
    },

    // TODO
    unmount() {},
    use() {
      return app
    },
    component(name: string, component: any) {
      return app
    },
    directive() {
      return app
    },
  }

  return app
}
