import { createRenderer } from '@vue/runtime-core/renderer'
import * as nodeOps from './nodeOps'
import type { ComponentOptions } from '@/types/runtime-core'
import { createVNode } from '@vue/runtime-core'
import { patchProp } from './patchProp'
import { isFunction } from '@/utils'

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

type PluginInstallFunction<Options = any[]> = Options extends unknown[]
  ? (app: App, ...options: Options) => any
  : (app: App, options: Options) => any

export type ObjectPlugin<Options = any[]> = {
  install: PluginInstallFunction<Options>
}
export type FunctionPlugin<Options = any[]> = PluginInstallFunction<Options> & Partial<ObjectPlugin<Options>>

export type Plugin<Options = any[], P extends unknown[] = Options extends unknown[] ? Options : [Options]> =
  | FunctionPlugin<P>
  | ObjectPlugin<P>

const renderer = createRenderer({ ...nodeOps, patchProp })

/**
 * 创建应用实例
 * @param rootComponent 根组件
 * @returns App 实例，包含 mount、use 等方法
 * Vue 团队刻意避免用 Class（轻量、便于tree-shaking）
 */
export function createApp(rootComponent: ComponentOptions): App {
  /** 已注册的插件 */
  const installedPlugins = new WeakSet()

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

    use(plugin: Plugin, ...options: any[]) {
      // 1. 防止重复安装
      if (installedPlugins.has(plugin)) {
        console.warn(`Plugin has already been applied to target app.`)
      }
      // 2. 对象插件：plugin.install(app, ...options)
      else if (plugin && isFunction(plugin.install)) {
        installedPlugins.add(plugin)
        plugin.install(app, ...options)
      }
      // 3. 函数插件：plugin(app, ...options)
      else if (isFunction(plugin)) {
        installedPlugins.add(plugin)
        plugin(app, ...options)
      }
      // 4. 不合法的插件
      else {
        console.warn(`A plugin must either be a function or an object with an "install" ` + `function.`)
      }

      return app
    },

    // TODO
    unmount() {},
    component(name: string, component: any) {
      return app
    },
    directive() {
      return app
    },
  }

  return app
}
