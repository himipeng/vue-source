import {
  NavigationDirection,
  NavigationType,
  type HistoryLocation,
  type HistoryState,
  type NavigationCallback,
  type RouterHistory,
} from '../types'

/**
 * @function createWebHistory
 * @description 基于浏览器 HTML5 History API 的路由历史管理。
 * 负责维护当前路径（location），并在路径变化时通知订阅者。
 */
export function createWebHistory(base?: string) {
  return new WebHistory(base)
}

/**
 * 基于 HTML5 History API 的路由历史管理
 */
export class WebHistory implements RouterHistory {
  /** 基础路径，前置于所有 URL 之前 */
  readonly base: string
  /** 当前路径（fullPath） */
  location: HistoryLocation
  /** 当前历史状态 */
  state: HistoryState
  /** 内部监听器集合 */
  private listeners: NavigationCallback[] = []

  /**
   * 构造函数
   * @param base - 基础路径，默认 '/'
   */
  constructor(base?: string) {
    this.base = base || '/'
    this.location = this.getCurrentLocation()
    this.state = history.state || {}
    // 监听 popstate 事件
    window.addEventListener('popstate', this.handlePopState)
  }

  /**
   * 获取当前浏览器 URL 的 fullPath，去掉 base 前缀
   * @returns {HistoryLocation} 当前路径
   */
  private getCurrentLocation(): HistoryLocation {
    const { pathname, search, hash } = window.location
    const path = pathname + search + hash
    return path.startsWith(this.base) ? path.slice(this.base.length) || '/' : path
  }

  /**
   * 触发所有注册的导航事件监听器
   * @param type - 导航类型
   * @param direction - 导航方向
   * @param delta - 历史记录偏移量
   * @param from - 原始路径
   */
  private triggerListeners(
    type: NavigationType,
    direction: NavigationDirection,
    delta: number,
    from?: HistoryLocation
  ) {
    const info = { type, direction, delta }
    const prev = from || this.location
    this.listeners.forEach((cb) => cb(this.location, prev, info))
  }

  /**
   * popstate 事件回调(back、forward、go 会触发，push、replace 不会触发)
   * @param e - PopStateEvent
   */
  private handlePopState = (e: PopStateEvent) => {
    const from = this.location
    this.location = this.getCurrentLocation()
    this.state = e.state || {}
    this.triggerListeners(NavigationType.pop, NavigationDirection.unknown, 0, from)
  }

  /**
   * 推入新历史记录
   * @param to - 目标 fullPath
   * @param data - 可选状态对象
   */
  push(to: HistoryLocation, data: HistoryState = {}): void {
    const href = this.createHref(to)
    const title = ''
    history.pushState(data, title, href)
    const from = this.location
    this.location = to
    this.state = data
    this.triggerListeners(NavigationType.push, NavigationDirection.forward, 1, from)
  }

  /**
   * 替换当前历史记录
   * @param to fullPath
   */
  replace(to: HistoryLocation, data: HistoryState = {}): void {
    const href = this.createHref(to)
    const title = ''
    history.replaceState(data, title, href)
    const from = this.location
    this.location = to
    this.state = data
    this.triggerListeners(NavigationType.replace, NavigationDirection.unknown, 0, from)
  }

  /**
   * 前进或后退历史记录
   * @param delta - 偏移量（正数前进，负数后退）
   */
  go(delta: number): void {
    history.go(delta)
    // popstate 事件会触发监听器
  }

  /**
   * 监听导航事件
   * @param callback - 回调函数
   * @returns 取消监听的函数
   */
  listen(callback: NavigationCallback): () => void {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) this.listeners.splice(index, 1)
    }
  }

  /**
   * 根据 fullPath 和路由模式生成完整 href
   * @param fullPath - 规范化后的完整路径，例如 "/home?page=1#top"
   * @returns href，用于 <a> 标签
   */
  createHref(fullPath: string): string {
    let base = this.base
    if (!base.endsWith('/')) base += '/'
    return `${base}${fullPath.startsWith('/') ? fullPath.slice(1) : fullPath}`
  }

  /**
   * 清理 popstate 事件监听
   */
  destroy(): void {
    window.removeEventListener('popstate', this.handlePopState)
    this.listeners = []
  }
}
