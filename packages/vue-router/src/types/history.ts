/**
 * 表示历史记录的路径
 */
export type HistoryLocation = string

/**
 * 历史状态的数组形式
 */
export interface HistoryStateArray extends Array<HistoryStateValue> {}

/**
 * 历史状态的可能值类型
 */
export type HistoryStateValue = string | number | boolean | null | undefined | HistoryState | HistoryStateArray

/**
 * HTML5 History.state 允许存储的数据类型
 */
export interface HistoryState {
  [x: number]: HistoryStateValue
  [x: string]: HistoryStateValue
}

/**
 * 导航方向枚举
 */
export enum NavigationDirection {
  /** 后退 */
  back = 'back',
  /** 前进 */
  forward = 'forward',
  /** 未知 */
  unknown = '',
}

export enum NavigationType {
  pop = 'pop',
  push = 'push',
  replace = 'replace',
}

/**
 * 导航信息，用于描述一次路由变化的类型、方向和步数
 */
export interface NavigationInformation {
  /** 导航类型，例如 push/replace/pop */
  type: NavigationType
  /** 导航方向 */
  direction: NavigationDirection
  /** pop 导航时的步数 */
  delta: number
}

/**
 * 导航回调类型
 * @param to - 目标路径
 * @param from - 上一个路径
 * @param information - 导航信息
 */
export interface NavigationCallback {
  (to: HistoryLocation, from: HistoryLocation, information: NavigationInformation): void
}

/**
 * 路由历史接口
 */
export interface RouterHistory {
  /** 基础路径，前置于所有 URL 之前，可用于子路径部署 */
  readonly base: string

  /** 当前路径 */
  readonly location: HistoryLocation

  /** 当前历史状态 */
  readonly state: HistoryState

  /**
   * 推入一个新的历史记录
   * @param to - 目标路径
   * @param data - 可选状态对象，关联到 history.state
   */
  push(to: HistoryLocation, data?: HistoryState): void

  /**
   * 替换当前的历史记录
   * @param to - 目标路径
   * @param data - 可选状态对象
   */
  replace(to: HistoryLocation, data?: HistoryState): void

  /**
   * 在历史中前进或后退
   * @param delta - 步数，负数表示后退，正数表示前进
   * @param triggerListeners - 是否触发监听器
   */
  go(delta: number, triggerListeners?: boolean): void

  /**
   * 监听导航事件
   * @param callback - 导航回调
   * @returns 取消监听的函数
   */
  listen(callback: NavigationCallback): () => void

  /**
   * 根据路径生成 href，可用于 <a> 标签
   * @param location - 目标路径
   */
  createHref(location: HistoryLocation): string

  /**
   * 清理历史记录相关的事件监听
   */
  destroy(): void
}
