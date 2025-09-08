import { ref, type Ref, type App } from '@purevue/vue'
import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteRecord,
  RouterHistory,
  RouterMatcherType,
  RouterOptions,
  RouterType,
} from '../types'
import { parseURL, stringifyURL } from '../utils'
import { createRouterMatcher } from '../matcher'
import { routeLocationKey, routerKey, routerViewLocationKey } from '../injectionSymbols'
import { RouterLink, RouterView } from '../components'

/**
 * @class Router
 * @description 路由核心类，管理路由状态、导航方法以及 Vue 插件安装。
 */
export class Router implements RouterType {
  /** 当前路由（响应式对象） */
  public currentRoute: Ref<RouteLocationNormalizedLoaded>
  /** 路由配置 */
  private routes: RouteRecord[]
  /** history 实例 */
  private history: RouterHistory
  /** 构造器选项 */
  private matcher: RouterMatcherType
  /** 是否已开始监听 */
  private listening: boolean = false
  /** 构造器选项 */
  public options: RouterOptions

  constructor(options: RouterOptions) {
    this.options = options
    this.history = options.history
    this.routes = options.routes
    this.matcher = createRouterMatcher(this.routes)

    // 初始化 currentRoute
    this.currentRoute = this.initCurrentRoute()

    // 启动监听
    this.listen()
  }

  /**
   * 获取匹配的路由
   */
  private getMatchedRoute(location: string): RouteLocationNormalizedLoaded {
    const locationNormalized = parseURL(location)
    const { path, fullPath, query, hash } = locationNormalized

    // 使用 matcher 解析当前路径，得到 matched、params、name、meta
    const matcherResult = this.matcher.resolve({ path })
    const { name, params, matched, meta } = matcherResult

    return {
      path,
      fullPath,
      name,
      query,
      params,
      matched,
      meta,
      hash,
      href: this.history.createHref(fullPath),
    }
  }

  /**
   * 初始化当前路由信息
   */
  private initCurrentRoute() {
    const matchedRoute = this.getMatchedRoute(this.history.location)
    return ref(matchedRoute)
  }

  /**
   * 启动 history 监听，更新 currentRoute
   */
  private listen() {
    if (this.listening) return
    this.history.listen((to, from, info) => {
      this.currentRoute.value = this.getMatchedRoute(to)
    })
    this.listening = true
  }

  /**
   * 路由跳转：push
   * @param to 目标路由，可以是字符串路径或对象形式
   */
  push(to: RouteLocationRaw) {
    return new Promise<void>((resolve, reject) => {
      try {
        // 先解析成规范化路由
        const resolved = this.resolve(to)
        this.history.push(resolved.fullPath)
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * 路由跳转：replace
   */
  replace(to: RouteLocationRaw) {
    return new Promise<void>((resolve, reject) => {
      try {
        const resolved = this.resolve(to)
        this.history.replace(resolved.fullPath)
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * 前进
   */
  forward() {
    // 不返回 Promise，直接触发浏览器行为
    this.history.go(1)
  }

  /**
   * 后退
   */
  back() {
    this.history.go(-1)
  }

  /**
   * 任意跳转 n 步
   */
  go(delta: number) {
    this.history.go(delta)
  }

  /**
   * 将原始路由信息解析为规范化的路由对象
   * @param rawLocation 目标路由，可以是字符串路径或对象形式，可能不完整
   * @param currentLocation 当前路由，可选，用于补全缺少的信息
   * @returns 规范化后的路由对象
   */
  resolve(rawLocation: RouteLocationRaw, currentLocation?: RouteLocationNormalizedLoaded): RouteLocationResolved {
    currentLocation = Object.assign({}, currentLocation || this.currentRoute.value)

    let resolved: RouteLocationResolved = {
      path: '',
      fullPath: '',
      name: undefined,
      params: {},
      query: {},
      matched: [],
      meta: {},
      hash: '',
      href: '',
    }

    // 字符串形式
    if (typeof rawLocation === 'string') {
      const locationNormalized = parseURL(rawLocation, currentLocation.path)
      resolved.path = locationNormalized.path
      resolved.fullPath = locationNormalized.fullPath
      resolved.hash = locationNormalized.hash
      resolved.query = locationNormalized.query
      resolved.href = this.history.createHref(resolved.fullPath)

      // 使用 matcher 匹配
      const matcherResult = this.matcher.resolve({ path: resolved.path })
      resolved.matched = matcherResult.matched
      resolved.params = matcherResult.params
      resolved.name = matcherResult.name
      resolved.meta = matcherResult.meta
    }
    // 对象形式
    else {
      const { path, name, params, query, hash } = rawLocation

      if (path) {
        const locationNormalized = parseURL(path, currentLocation.path)
        resolved.path = locationNormalized.path
        resolved.hash = locationNormalized.hash
        resolved.query = locationNormalized.query
      }

      if (name) resolved.name = name
      if (hash) resolved.hash = hash
      if (params) resolved.params = params
      if (query) resolved.query = Object.assign({}, resolved.query, query)

      // 使用 matcher 匹配（优先按 name 匹配，否则按 path 匹配）
      const matcherResult = this.matcher.resolve(
        {
          name: resolved.name,
          path: resolved.path,
          params: resolved.params,
        },
        currentLocation
      )
      resolved.matched = matcherResult.matched
      resolved.params = matcherResult.params
      resolved.name = matcherResult.name
      resolved.meta = matcherResult.meta

      resolved.fullPath = stringifyURL(resolved)
      resolved.href = this.history.createHref(resolved.fullPath)
    }

    return resolved
  }

  /**
   * Vue 插件安装方法
   * @param app Vue 应用实例
   */
  install(app: App) {
    // 注入全局值
    app.provide(routerKey, this)
    app.provide(routeLocationKey, this.currentRoute)
    app.provide(routerViewLocationKey, this.currentRoute)

    // 注册 RouterView / RouterLink 组件
    app.component('RouterLink', RouterLink)
    app.component('RouterView', RouterView)
  }
}

/**
 * 工厂函数
 */
export function createRouter(options: RouterOptions) {
  return new Router(options)
}
