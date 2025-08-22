import type {
  ComponentInternalInstance,
  ComponentOptions,
  ComponentPublicInstance,
  RenderFunction,
  VNode,
} from '@/types/runtime-core'
import { compileToFunction } from '@vue/runtime-dom'

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
  const instance: ComponentInternalInstance = {
    uid: uid++,
    vnode,
    type: vnode.type as ComponentOptions,
    parent,
    root: parent ? parent.root : null!, // root 指向最顶层
    subTree: null!,
    render: null,
    proxy: null,
    effect: null!,
    update: () => {},
    props: vnode.props || {},
    ctx: {},
    components: null,
    isMounted: false,
    isUnmounted: false,
    appContext: null,
  }

  // 初始化 ctx，稍后 Proxy 包装
  instance.ctx = { _: instance }

  // TODO: applyOptions
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
      Object.assign(instance.ctx, setupResult)
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
      // TODO
      if (key === '$') return instance

      const { props, ctx } = instance
      if (key in props) return props[key]
      if (key in ctx) return (ctx as any)[key]
      return undefined
    },
    // TODO: set
  }) as ComponentPublicInstance
}
