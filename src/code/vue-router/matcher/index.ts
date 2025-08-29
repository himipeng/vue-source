import type { RouteRecordNormalized, RouteRecordRaw } from '../types'
import type { MatcherLocation, MatcherLocationRaw, RouteRecordMatcher, RouterMatcherType } from '../types/matcher'

/**
 * RouterMatcher 类
 * 管理路由记录（RouteRecord）和匹配规则，用于根据 path 或 name 解析路由
 */
export class RouterMatcher implements RouterMatcherType {
  /** 匹配器列表，按路径长度排序，用于匹配路由 */
  private matchers: RouteRecordMatcher[] = []
  /** 路由名映射表，快速根据 name 获取 matcher */
  private matcherMap = new Map<string, RouteRecordMatcher>()

  /**
   * 构造函数
   * @param routes 初始路由列表
   */
  constructor(routes: RouteRecordRaw[] = []) {
    // 遍历初始路由，依次添加
    routes.forEach((route) => this.addRoute(route))
  }

  /** 创建单个 matcher */
  private createRouteRecordMatcher(record: RouteRecordNormalized, parent?: RouteRecordMatcher): RouteRecordMatcher {
    const { re, keys } = this.compilePath(record.path)
    return {
      record,
      parent,
      alias: [],
      re,
      keys,
      // 将参数对象填入路径模板，生成最终路径
      // 例如路径模板 "/user/:id/profile/:tab" 和参数 { id: '123', tab: 'home' }
      // 生成 "/user/123/profile/home"
      stringify: (params: Record<string, string> = {}) => {
        let path = record.path
        // 遍历参数名数组 keys，把模板中的 :paramName 替换为实际值
        for (const key of keys) path = path.replace(`:${key}`, params[key] ?? '')
        return path
      },
    }
  }

  /**
   * 将路径字符串编译为正则表达式，并提取路径参数名
   * 例如 `/user/:id/profile/:tab` -> { re: /^\/user\/([^/]+)\/profile\/([^/]+)$/, keys: ['id', 'tab'] }
   * @param path 路由路径字符串，可能包含 :paramName 的参数
   * @returns 对象，包含正则 re 和参数名 keys
   */
  private compilePath(path: string): { re: RegExp; keys: string[] } {
    const keys: string[] = []

    // 将路径中的 :paramName 替换为捕获组 ([^/]+)
    // 同时把 paramName 收集到 keys 数组中
    const re = new RegExp(
      path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
        keys.push(key)
        return '([^/]+)'
      }) + '$' // $ 表示匹配完整路径
    )

    return { re, keys }
  }

  /**
   * 添加路由
   * @param record 路由记录
   * @param parent 父级 matcher，可选
   * @returns 删除函数，调用可移除该路由
   */
  addRoute(record: RouteRecordRaw, parent?: RouteRecordMatcher): () => void {
    // 标准化路由对象，初始化 children 数组
    const children = record.children || []
    const components = record.components || { default: record.component! }
    const normalized: RouteRecordNormalized = { ...record, children, components }

    // 拼接父路径，如果不是绝对路径，则加上父路径
    if (parent && normalized.path[0] !== '/') {
      const parentPath = parent.record.path
      normalized.path = parentPath + (parentPath.endsWith('/') ? '' : '/') + normalized.path
    }

    // 创建单个 matcher
    const matcher = this.createRouteRecordMatcher(normalized, parent)

    // 插入 matcher，保持按路径长度排序，保证长路径优先匹配
    const index = this.matchers.findIndex((m) => m.record.path.length > matcher.record.path.length)
    if (index < 0) this.matchers.push(matcher)
    else this.matchers.splice(index, 0, matcher)

    // 如果有路由 name，则存入映射表
    if (matcher.record.name) this.matcherMap.set(matcher.record.name, matcher)

    // 递归添加子路由
    children.forEach((child) => this.addRoute(child, matcher))

    // 返回删除该路由的函数
    return () => this.removeRoute(matcher)
  }

  /**
   * 删除路由
   * @param nameOrMatcher 路由名或 matcher 对象
   */
  removeRoute(nameOrMatcher: string | RouteRecordMatcher) {
    let matcher: RouteRecordMatcher | undefined
    if (typeof nameOrMatcher === 'string') matcher = this.matcherMap.get(nameOrMatcher)
    else matcher = nameOrMatcher
    if (!matcher) return

    // 从 matchers 列表移除
    const index = this.matchers.indexOf(matcher)
    if (index > -1) this.matchers.splice(index, 1)
    // 从 name 映射表移除
    if (matcher.record.name) this.matcherMap.delete(matcher.record.name)
    // 移除 alias 和子路由
    matcher.alias.forEach((a) => this.removeRoute(a))
    matcher.record.children.forEach((child) => this.removeRoute(child.path))
  }

  /** 清空所有路由和映射表 */
  clearRoutes(): void {
    this.matchers.length = 0
    this.matcherMap.clear()
  }

  /**
   * 解析路由，根据路由配置和路径或名字，找到匹配的路由记录
   * @param location 路由目标（path 或 name）
   * @param currentLocation 当前路由，可选
   * @returns 解析后的标准化路由对象
   */
  resolve(location: MatcherLocationRaw, currentLocation?: MatcherLocation): MatcherLocation {
    let matcher: RouteRecordMatcher | undefined
    let params: Record<string, string> = {}
    let path: string = ''

    // 通过 name 匹配
    if (location.name) {
      matcher = this.matcherMap.get(location.name)
      if (!matcher) throw new Error(`Route with name "${location.name}" not found`)
      params = { ...(location.params || {}) }
      path = matcher.stringify(params)
    }
    // 通过 path 匹配
    else if (location.path) {
      path = location.path
      matcher = this.matchers.find((m) => m.re.test(path))
      if (matcher) {
        // 例如 /user/:id → /user/([^/]+)$
        const match = path.match(matcher.re)
        if (match)
          matcher.keys.forEach((key, i) => {
            // 捕获组对应的各个动态参数
            params[key] = match[i + 1]
          })
      }
    }
    // fallback: 使用当前路由
    else if (currentLocation) {
      path = currentLocation.path
      matcher = this.matchers.find((m) => m.re.test(path))
      params = { ...(currentLocation.params || {}), ...(location.params || {}) }
    }

    // 构建匹配链，从父到子
    const matched: RouteRecordNormalized[] = []
    let parentMatcher = matcher
    while (parentMatcher) {
      matched.unshift(parentMatcher.record)
      parentMatcher = parentMatcher.parent
    }

    return {
      path,
      name: matcher?.record.name,
      params,
      matched,
      meta: Object.assign({}, ...matched.map((m) => m.meta || {})),
    }
  }

  /** 获取所有 matchers */
  getRoutes(): RouteRecordMatcher[] {
    return this.matchers
  }

  /** 根据 name 获取 matcher */
  getRecordMatcher(name: string): RouteRecordMatcher | undefined {
    return this.matcherMap.get(name)
  }
}

/** 工厂函数，创建 RouterMatcher 实例 */
export function createRouterMatcher(routes?: RouteRecordRaw[]) {
  return new RouterMatcher(routes)
}
