import type { App, Ref } from '@purevue/vue'
import type { RouteRecord } from './route'
import type { RouteLocationNormalizedLoaded, RouteLocationRaw, RouteLocationResolved } from './location'
import type { RouterHistory } from './history'

/**
 * @interface RouterOptions
 * @description Router 构造器选项
 */
export interface RouterOptions {
  history: RouterHistory
  routes: RouteRecord[]
}

/**
 * Router 接口
 */
export interface RouterType {
  /**
   * 当前激活的路由对象（响应式）
   * - 用于 `<router-view>` 和 `useRoute`
   */
  readonly currentRoute: Ref<RouteLocationNormalizedLoaded>
  /**
   * 路由器配置
   */
  readonly options: RouterOptions
  /**
   * 解析目标路由
   * @param to - 目标路径（字符串或对象）
   * @param currentLocation - 当前路由，可选
   * @returns 标准化后的路由对象
   */
  resolve(to: RouteLocationRaw, currentLocation?: RouteLocationNormalizedLoaded): RouteLocationResolved
  /**
   * 导航到一个新路由，追加到历史记录栈
   * @param to - 目标路由位置
   * @returns Promise，表示导航是否成功，支持异步
   */
  push(to: RouteLocationRaw): Promise<void>
  /**
   * 替换当前路由，不会新增历史记录
   * @param to - 目标路由位置
   * @returns Promise，表示导航是否成功
   */
  replace(to: RouteLocationRaw): Promise<void>
  /**
   * 在历史记录中前进或后退
   * @param delta - 步数（负数后退，正数前进）
   */
  go(delta: number): void
  /**
   * 向后退一步，等价于 go(-1)
   */
  back(): void
  /**
   * 向前进一步，等价于 go(1)
   */
  forward(): void
  /**
   * 安装 Router 插件到应用
   * - 注册全局组件（router-view / router-link）
   * - 注入 Router 实例
   * @param app - Vue 应用实例
   */
  install(app: App): void
}
