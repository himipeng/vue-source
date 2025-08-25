import type { ComponentOptions } from 'vue'

/**
 * @interface RouteRecord
 * @description 单个路由配置
 */
export interface RouteRecord {
  /** 路径 */
  path: string
  /** 路由名称，可选，用于命名路由 */
  name?: string
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
  /** 别名 */
  alias?: string | string[]
}

/**
 * 路由记录类型
 */
export interface RouteRecordRaw extends RouteRecord {}

/**
 * 解析后的规范化路由记录
 */
export interface RouteRecordNormalized extends RouteRecordRaw {
  aliasOf?: RouteRecordNormalized
  children: RouteRecordRaw[]
}
