import type { RenderFunction } from './vnode'

/**
 * 通用的组件选项定义（兼容 Vue2/Vue3）
 */
export interface ComponentOptions extends LifecycleHooks {
  /** 标识当前组件的风格 */
  $type?: 'vue2' | 'vue3'
  /** 组件名 */
  name?: string
  /** 模板字符串 */
  template?: string
  /** 子组件 */
  components?: Record<string, ComponentOptions>
  /** data 选项 */
  data?: (() => Record<string, any>) | Record<string, any>
  /** methods */
  methods?: Record<string, (this: any, ...args: any[]) => any>
  /** Vue3 setup，兼容返回 render */
  setup?: (props?: Record<string, any>, ctx?: any) => Record<string, any> | RenderFunction
  /** 计算属性 */
  computed?: Record<string, () => any>
  /** 侦听器 */
  watch?: Record<string, (newVal: any, oldVal: any) => void>
  /** 渲染函数 */
  render?: RenderFunction
  /** props 定义 */
  props?: Record<string, any>
  /** 自定义指令 */
  directives?: Record<string, Function>
  /** Vue2 filters（Vue3 已废弃） */
  filters?: Record<string, Function>
  /** 依赖注入 provide */
  provide?: () => Record<string, any>
  /** 依赖注入 inject */
  inject?: string[]
}

/**
 * 生命周期钩子
 * - Vue2: beforeDestroy/destroyed
 * - Vue3: beforeUnmount/unmounted
 */
interface LifecycleHooks {
  beforeCreate?: () => void
  created?: () => void
  beforeMount?: () => void
  mounted?: () => void
  beforeUpdate?: () => void
  updated?: () => void

  /** Vue2 */
  beforeDestroy?: () => void
  destroyed?: () => void

  /** Vue3 */
  beforeUnmount?: () => void
  unmounted?: () => void
}
