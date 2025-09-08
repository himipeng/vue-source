import type {
  ComponentInternalInstance,
  ComponentOptions,
  ComponentPublicInstance,
  RenderFunction,
  SetupContext,
  VNode,
} from '../types'
import { proxyRefs } from '@purevue/reactivity'
import { createAppContext } from '../createAppAPI'
import { capitalize } from '@purevue/shared'
import { pauseTracking, resetTracking } from '@purevue/reactivity'

export * from './defineComponent'

type CompileFunction = (template: string | HTMLElement, options?: object) => any

/** 运行时编译器 */
let compile: CompileFunction | undefined

/**
 * 注册运行时编译器函数
 *
 * Vue 的 runtime-core 本身只支持执行 render 函数，
 * 并不知道如何把 template 编译成 render。
 *
 * 在 full build (带 compiler) 的入口中，会调用此方法，
 * 将编译函数 compileToFunction 注入到 runtime-core。（解耦）
 *
 * 这样 runtime-core 就可以在组件初始化时，如果发现组件只有 template
 * 而没有 render，就调用这个全局注册的 compile，把 template 转换为 render。
 *
 * @param _compile - 用于将模板字符串编译为 render 函数的实现
 */
export function registerRuntimeCompiler(_compile: CompileFunction): void {
  compile = _compile
}

let uid = 0
/**
 * 创建组件实例
 * 在 Vue3 源码中，组件实例（component instance） 是一个 普通的对象（更轻量，易于 Tree-shaking），
 * 由 createComponentInstance 工厂函数创建出来的，而不是 class
 */
export function createComponentInstance(
  vnode: VNode,
  parent: ComponentInternalInstance | null = null
): ComponentInternalInstance {
  const type = vnode.type as ComponentOptions
  const appContext = (parent ? parent.appContext : vnode.appContext) || createAppContext()

  const instance: ComponentInternalInstance = {
    uid: uid++,
    vnode,
    type,
    parent,
    root: parent ? parent.root : null!, // root 指向最顶层
    subTree: null!,
    render: null,
    proxy: null,
    effect: null!,
    update: () => {},
    components: null,
    isMounted: false,
    isUnmounted: false,
    appContext,
    next: null,
    // 根组件继承app上下文的provides、其他继承自父组件
    provides: parent ? parent.provides : Object.create(appContext.provides),

    // 状态
    ctx: {},
    setupState: {},
    props: vnode.props || {},

    attrs: {},
    slots: {},
    emit: null!,
    exposed: null,
  }

  // 初始化 ctx，稍后 Proxy 包装
  instance.ctx = { _: instance }

  // TODO: applyOptions
  // 用于 处理 Options API（即 data, computed, methods, watch, lifecycle hooks 等）选项的函数

  instance.components = (vnode.type as ComponentOptions).components!

  return instance
}

/**
 * 初始化组件，执行 setup / compile template
 */
export function setupComponent(instance: ComponentInternalInstance) {
  const Component = instance.type

  // setup 优先
  if (Component.setup) {
    // 暂停收集起来
    pauseTracking()
    // 设置当前实例
    const reset = setCurrentInstance(instance)
    // 执行 setup
    const setupContext = createSetupContext(instance)
    const setupResult = Component.setup(instance.props, setupContext)
    // 恢复收集依赖
    resetTracking()
    // 恢复当前实例
    reset()

    // 返回值为 render 时
    if (typeof setupResult === 'function') {
      instance.render = setupResult as RenderFunction
    }
    // 返回值为对象
    else if (typeof setupResult === 'object') {
      // 自动解包 .value
      instance.setupState = proxyRefs(setupResult)
    }
  }

  // 如果有 render，直接用
  if (!instance.render && Component.render) {
    instance.render = Component.render
  }

  // 如果只有 template，需要编译成 render
  else if (!instance.render && Component.template && compile) {
    instance.render = compile(Component.template)
  }

  // 创建 proxy 代理 this
  instance.proxy = new Proxy(instance.ctx, {
    // 数据代理
    get(target, key: string) {
      if (key === '$') return instance

      const { setupState, props, ctx } = instance
      if (setupState && key in setupState) return setupState[key]
      if (props && key in props) return props[key]
      if (ctx && key in ctx) return (ctx as any)[key]
      return undefined
    },
    set(target, key: string, value) {
      const { setupState, props, ctx } = instance

      if (setupState && key in setupState) {
        setupState[key] = value
        return true
      }
      // props 不能修改
      if (props && key in props) {
        console.warn(`Attempting to mutate prop "${key}". Props are readonly.`)
        return false
      }
      if (ctx && key in ctx) {
        ctx[key] = value
        return true
      }
      return false
    },
  }) as ComponentPublicInstance
}

/** 当前正在执行的组件实例 */
export let currentInstance: ComponentInternalInstance | null = null

/**
 * 获取当前组件实例
 */
export const getCurrentInstance = () => {
  return currentInstance
}

/** 设置当前组件实例，并返回恢复函数 */
export const setCurrentInstance = (instance: ComponentInternalInstance) => {
  const prev = currentInstance
  currentInstance = instance
  // TODO: 依赖收集作用域
  // instance.scope.on()
  return (): void => {
    // instance.scope.off()
    currentInstance = prev
  }
}

/**
 * 创建 setup context
 * @param instance - 当前组件实例
 * @returns SetupContext 对象
 */
export function createSetupContext(instance: ComponentInternalInstance): SetupContext {
  return {
    attrs: instance.attrs || {},
    slots: instance.slots || {},
    emit: (event: string, ...args: any[]) => {
      const handler = instance.vnode.props?.[`on${capitalize(event)}`]
      if (handler) handler(...args)
    },
    expose: (exposed?: Record<string, any>) => {
      instance.exposed = exposed || {}
    },
  }
}
