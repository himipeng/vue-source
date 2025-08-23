import type {
  ComponentInternalInstance,
  ComponentOptions,
  ComponentPublicInstance,
  RenderFunction,
  VNode,
} from '@/types/runtime-core'
import { compileToFunction, createAppContext } from '@vue/runtime-dom'
import { proxyRefs } from '@vue/vue3/Component/proxyRefs'

export * from './defineComponent'

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

    // 状态
    ctx: {},
    setupState: {},
    props: vnode.props || {},
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
    const setupResult = Component.setup(instance.props, { attrs: {} })
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
  else if (!instance.render && Component.template) {
    instance.render = compileToFunction(Component.template)
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
