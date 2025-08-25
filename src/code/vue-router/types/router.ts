import type { App, ComponentOptions, Ref } from 'vue'
import type { createWebHistory } from '../history'

/**
 * 已解析的路由位置
 * router.resolve(to) 解析 RouteLocationRaw 后得到
 * 包含了 完整的路由信息
 */
export interface RouteLocationResolved {
  /** 最终路径 */
  path: string
  /** 路由名称 */
  name?: string
  /** 参数 */
  params: Record<string, any>
  /** 查询参数 */
  query: Record<string, any>
  /** 完整路径，包含 query 和 hash */
  fullPath: string
  /** 哈希值 */
  hash: string
  /**
   * 在 Vue Router 中的导航链接（href）
   * 对应渲染在 <a> 标签的 href 属性，用于浏览器跳转。
   *
   * 构建规则：
   * - 会加上应用的 base 路径（如果存在）
   * - 在 history 模式下，href = base + fullPath
   * - 在 hash 模式下，href = base + '/#' + fullPath
   */
  href: string
  /**
   * 当前路由匹配到的所有路由记录，保存了从根到目标路由的完整匹配链
   * 用于生成嵌套路由对应的组件树
   */
  matched: RouteRecord[]
  /**
   * 合并后的 meta 信息
   * 来自于 matched 中所有路由记录的 meta
   */
  meta: Record<string, any>
}

/**
 * 路由的原始位置（用户传入的目标位置）
 * 灵活，但可能不完整
 */
export type RouteLocationRaw = string | Partial<RouteLocationResolved>

/**
 * 规范化后的路由对象
 * 表示 当前路由（已经进入并加载好的路由）
 */
export interface RouteLocationNormalizedLoaded extends RouteLocationResolved {}

/**
 * @interface RouteRecord
 * @description 单个路由配置
 */
export interface RouteRecord {
  /** 路由名称，可选，用于命名路由 */
  name?: string
  /** 路径 */
  path: string
  /** 路由组件，可为单个组件或命名视图对象 */
  component?: ComponentOptions
  /** 嵌套路由 */
  children?: RouteRecord[]
  /** 路由元信息，可自定义存储权限、标题等信息 */
  meta?: Record<string, any>
  /** 是否严格匹配末尾斜杠 */
  strict?: boolean
  /** 是否精确匹配 */
  exact?: boolean
}

/**
 * @interface RouterOptions
 * @description Router 构造器选项
 */
export interface RouterOptions {
  history: ReturnType<typeof createWebHistory>
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
