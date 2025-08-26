import { createRenderer } from '@vue/runtime-core/renderer'
import * as nodeOps from './nodeOps'
import type { App, AppContext, ComponentOptions, Plugin } from '@vue/types/runtime-core'
import { createVNode } from '@vue/runtime-core'
import { patchProp } from './patchProp'
import { isFunction } from '@/utils'
import type { InjectionKey } from '@vue/types/reactivity'

/** 渲染器 */
const renderer = createRenderer({ ...nodeOps, patchProp })

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

/**
 * 创建应用实例
 * @param rootComponent 根组件
 * @returns App 实例，包含 mount、use 等方法
 * Vue 团队刻意避免用 Class（轻量、便于tree-shaking）
 */
export function createApp(rootComponent: ComponentOptions): App {
  /** 已注册的插件 */
  const installedPlugins = new WeakSet()
  /** 上下文，存储全局组件、指令、provide/inject 数据等 */
  const context = createAppContext()

  const app: App = (context.app = {
    _container: null,
    _context: context,
    mount(rootContainer: Element | string) {
      // 获取真实 DOM 容器
      const container = typeof rootContainer === 'string' ? document.querySelector(rootContainer)! : rootContainer

      // 1. 创建根 vnode
      const vnode = createVNode(rootComponent)
      // 挂载上下文
      vnode.appContext = context

      // 2. 调用 renderer 的 render
      renderer.render(vnode, container)

      // 3. 保存挂载容器
      app._container = container

      // 子组件在渲染时可以通过 vnode.appContext 访问全局配置、全局组件和 provide 注入的值

      return vnode.component!.proxy!
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

    component(name: string, component?: ComponentOptions) {
      if (!component) {
        // 如果没有传 component 参数，返回已注册组件
        return context.components[name] as any
      }

      // 如果组件已经注册，提示警告
      if (context.components[name]) {
        console.warn(`Component "${name}" has already been registered in target app.`)
      }

      // 注册组件
      context.components[name] = component

      // 支持链式调用
      return app
    },

    // TODO
    unmount() {},

    directive() {
      return app
    },

    provide<T>(key: InjectionKey, value: T) {
      context.provides[key] = value
      return app
    },
  })

  return app
}
