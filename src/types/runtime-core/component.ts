import type ReactiveEffect from '@vue/vue3/ReactiveEffect'
import type { RenderFunction, VNode } from '.'
import type { ComponentOptions } from './componentOptions'

export type Data = Record<string, unknown>
export type LifecycleHook<TFn = Function> = TFn /* & SchedulerJob */[] | null

export enum LifecycleHooks {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'um',
  DEACTIVATED = 'da',
  ACTIVATED = 'a',
  RENDER_TRIGGERED = 'rtg',
  RENDER_TRACKED = 'rtc',
  ERROR_CAPTURED = 'ec',
  SERVER_PREFETCH = 'sp',
}

interface Lifecycle {
  [LifecycleHooks.BEFORE_MOUNT]: LifecycleHook
  [LifecycleHooks.MOUNTED]: LifecycleHook
  [LifecycleHooks.BEFORE_UNMOUNT]: LifecycleHook
  [LifecycleHooks.UNMOUNTED]: LifecycleHook
}

type ConcreteComponent =
  // | FunctionalComponent // 函数式组件（暂不实现）
  ComponentOptions // 选项式组件（data、methods、setup、render）defineComponent() 返回的配置对象

/**
 * Vue3 内部的组件实例（简化版）。
 *
 * 说明：
 * - 这是 runtime 渲染过程中维护的组件核心状态。
 * - 实例会在 mountComponent 时被创建。
 * - 保留了组件渲染循环和响应式更新所必需的字段。
 */
export interface ComponentInternalInstance extends Partial<Lifecycle> {
  /** 唯一 id，用于区分不同组件实例 */
  uid: number
  /** 当前组件的定义对象 */
  type: ConcreteComponent
  /** 注册子组件定义对象 */
  components: Record<string, ConcreteComponent> | null
  /** 父组件实例（根组件为 null） */
  parent: ComponentInternalInstance | null
  /** 根组件实例（指向应用的根） */
  root: ComponentInternalInstance
  /** 当前组件对应的 VNode */
  vnode: VNode
  /** 挂载或更新后生成的子树 VNode */
  subTree: VNode
  /** 渲染副作用，用于追踪依赖 */
  effect: ReactiveEffect
  /** 触发重新渲染的方法（effect.run） */
  update: () => void
  /** 渲染函数（setup 返回或 options.render） */
  render: RenderFunction | null
  setupState: Data
  /** 代理对象，用于处理模板中的 `this` 访问 */
  proxy: ComponentPublicInstance | null
  /** 组件的 props 数据 */
  props: Data
  /** 组件的上下文（methods、computed、用户挂载的数据等） */
  ctx: Data
  /** 是否已挂载 */
  isMounted: boolean
  /** 是否已卸载 */
  isUnmounted: boolean
  /** 全局注册区域 */
  appContext: AppContext
}

type AppContext = any // TODO 全局注册对象

/**
 * Public component instance (对外暴露的组件实例类型)
 * - 这是用户在组件中通过 `this` 访问到的对象
 * - Vue 内部通过 Proxy 包装 ComponentInternalInstance 得到
 */
export type ComponentPublicInstance = {
  /** 内部真实实例 (不推荐用户访问) */
  $: ComponentInternalInstance
  /** data() 返回的响应式数据 */
  $data: Record<string, any>
  /** props 数据（只读） */
  $props: Record<string, any>
  /** 非 prop 传入的属性 (透传 attrs) */
  $attrs: Record<string, any>
  /** ref 引用对象集合 */
  $refs: Record<string, any>
  /** 插槽对象 */
  $slots: Record<string, any>
  /** 根组件实例 */
  $root: ComponentPublicInstance | null
  /** 父组件实例 */
  $parent: ComponentPublicInstance | null
  /** 当前组件挂载的宿主元素 */
  $el: Element | null
  /** 当前组件的选项对象（data/methods/computed 等） */
  $options: Record<string, any>
  /** 触发自定义事件 */
  $emit: (event: string, ...args: any[]) => void
  /** 强制组件重新渲染 */
  $forceUpdate: () => void
  /** 下一次 DOM 更新后执行回调 */
  $nextTick: (fn: () => void) => Promise<void>
  /** 监听响应式数据变化（用户版的 watch API） */
  $watch: (
    source: string | Function,
    cb: (newVal: any, oldVal: any) => void,
    options?: Record<string, any>
  ) => () => void
} & Record<string, any> // 同时允许访问 data/props/computed/methods 等
