import type { RouteRecord } from "./route"

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
