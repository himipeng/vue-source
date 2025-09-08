import type { InjectionKey } from '@pure-vue/reactivity'
import type { ComponentPublicInstance } from './component'
import type { ComponentOptions } from './componentOptions'

/**
 * Vue App 实例接口
 */
export interface App<HostElement = Element> {
  /**
   * 挂载组件到宿主元素
   * @param rootContainer 宿主元素或选择器
   * @returns 挂载的根组件实例
   */
  mount(rootContainer: HostElement | string): ComponentPublicInstance
  /**
   * 卸载应用
   */
  unmount(): void
  /**
   * 全局注入
   */
  provide<T>(key: InjectionKey, value: T): this
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
  use(plugin: Plugin, ...options: any[]): this
  /**
   * 获取应用配置
   */
  config?: Record<string, any>
  /**
   * 挂载容器
   */
  _container: HostElement | null
  /** 上下文，存储全局组件、指令、provide/inject 数据等 */
  _context: AppContext
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

/**
 * 应用上下文类型
 * 用于保存全局注册的组件、指令、mixins、提供的依赖等信息。
 */
export interface AppContext {
  /**
   * 当前应用实例，主要用于 devtools 调试。
   */
  app: App

  /**
   * 全局 mixins 列表。
   * Vue 允许全局注册 mixins，会作用于每个组件实例。
   */
  mixins: ComponentOptions[]

  /**
   * 全局注册的组件表。
   * key: 组件名，value: 组件选项对象
   * 用于 createApp.component(name, component) 注册和全局查找
   */
  components: Record<string, ComponentOptions>

  /**
   * provide/inject 依赖注入表。
   * key: string 或 symbol，用于标识依赖
   * value: 对应的依赖值
   * 用于全局提供依赖，让子组件可以通过 inject() 获取
   */
  provides: Record<string | symbol, any>

  // /**
  //  * 全局配置，如性能选项、warnHandler 等
  //  */
  // config: AppConfig
}
