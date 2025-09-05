import type { RouteLocationResolved } from './location'
import type { RouteRecordNormalized, RouteRecordRaw } from './route'

/**
 * Matcher 接口
 */
export interface RouteRecordMatcher {
  /** 路由记录 */
  record: RouteRecordNormalized
  /** 父级匹配器 */
  parent?: RouteRecordMatcher
  /** 别名匹配器数组 */
  alias: RouteRecordMatcher[]
  /** 正则表达式，用于匹配动态路由 */
  re: RegExp
  /** 参数键名数组 */
  keys: string[]
  /** 生成路径字符串的函数 */
  stringify: (params?: Record<string, string>) => string
}

export type MatcherLocation = Pick<RouteLocationResolved, 'name' | 'path' | 'params' | 'meta' | 'matched'>
export type MatcherLocationRaw = Partial<MatcherLocation>

export interface RouterMatcherType {
  /** 添加路由 */
  addRoute: (record: RouteRecordRaw, parent?: RouteRecordMatcher) => () => void
  /** 移除路由 */
  removeRoute(matcher: string | RouteRecordMatcher): void
  /** 清除所有路由 */
  clearRoutes: () => void
  /** 获取所有路由匹配器 */
  getRoutes: () => RouteRecordMatcher[]
  /** 根据名称获取路由匹配器 */
  getRecordMatcher: (name: string) => RouteRecordMatcher | undefined
  /** 解析路由位置 */
  resolve: (location: MatcherLocationRaw, currentLocation?: MatcherLocation) => MatcherLocation
}
