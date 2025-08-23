import type {
  ComponentInternalInstance,
  RendererNode,
  VNode,
  VNodeArrayChildren,
  VNodeChild,
} from '@/types/runtime-core'
import { createVNode, Text } from '@vue/runtime-core'
import { ShapeFlags } from '@vue/shared'
import { createComponentInstance, setupComponent } from './component'
import { ReactiveEffect } from '@vue/reactivity'

/**
 * RendererOptions 表示渲染器操作宿主环境的 API
 */
export interface RendererOptions<HostElement = any, HostText = any> {
  insert: (child: HostElement | HostText, parent: HostElement, anchor?: HostElement | null) => void
  remove: (child: HostElement | HostText) => void
  createElement: (tag: string) => HostElement
  createText: (text: string) => HostText
  setText: (node: HostText, text: string) => void
  setElementText: (el: HostElement, text: string) => void
  patchProp: (el: HostElement, key: string, prevValue: any, nextValue: any) => void
  // [key: string]: any
}

/**
 * Renderer 接口类型
 */
export interface Renderer<HostElement = any> {
  /**
   * 渲染 VNode 到宿主容器
   * @param vnode 要渲染的 VNode
   * @param container 宿主容器
   */
  render: (vnode: VNode | null, container: HostElement) => void
}

/**
 * 标准化vnode
 * 把 string / number 转为 Text VNode
 */
function normalizeVNode(child: VNodeChild): VNode {
  if (typeof child === 'string' || typeof child === 'number') {
    return createVNode(Text, null, String(child))
  }
  return child as VNode
}

export function createRenderer<HostElement = RendererNode>(options: RendererOptions): Renderer {
  const {
    createText: hostCreateText,
    insert: hostInsert,
    setText: hostSetText,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
  } = options

  /**
   * 渲染入口
   * @param vnode VNode 或 null
   * @param container 宿主容器
   */
  function render(vnode: VNode | null, container: HostElement) {
    if (vnode == null) {
      // // 如果 vnode 为 null，卸载容器中的内容
      // if (container._vnode) {
      //   unmount(container._vnode)
      // }
    } else {
      // patch(container._vnode || null, vnode, container)
      patch(null, vnode, container)
    }
    // container._vnode = vnode
  }

  /**
   * 对比新旧 VNode 并更新
   * @param n1 旧节点
   * @param n2 新节点k0
   * @param container 容器
   * @param anchor 参照节点,用于 确定新节点插入的位置,为null时插入到结尾
   */
  function patch(n1: VNode | null, n2: VNode, container: HostElement, anchor: HostElement | null = null) {
    if (n1 === n2) return

    // 卸载节点
    if (n1 && n1.type !== n2.type) {
      // 类型不同直接卸载旧节点
      // TODO: unmount(n1)
      n1 = null
    }

    const { type, shapeFlag } = n2
    switch (type) {
      // TODO: 处理其他类型
      case Text:
        processText(n1, n2, container)
        break
      // 处理原生元素或组件
      default:
        // 原生元素
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container)
        }
        // 组件
        else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container)
        }
    }
  }

  // TODO
  function unmount(vnode: VNode) {
    // remove(vnode.el!)
  }

  /**
   * 处理元素 vnode
   */
  function processElement(n1: VNode | null, n2: VNode, container: HostElement, anchor: HostElement | null = null) {
    if (!n1) {
      mountElement(n2, container, anchor)
    } else {
      patchElement(n1, n2)
    }
  }

  /**
   * 对比两个元素 VNode，并更新真实 DOM
   *
   * @param n1 旧的 VNode
   * @param n2 新的 VNode
   */
  function patchElement(n1: VNode, n2: VNode) {
    // 复用旧节点的真实 DOM 元素
    const el = (n2.el = n1.el!)

    // 获取旧属性与新属性
    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    // 更新子节点
    patchChildren(n1, n2, el as HostElement)

    // 更新属性
    patchProps(el as HostElement, oldProps, newProps)
  }

  /**
   * 更新元素的子节点
   *
   * @param n1 旧的 VNode
   * @param n2 新的 VNode
   * @param container 宿主 DOM 元素，用于挂载子节点
   */
  function patchChildren(n1: VNode, n2: VNode, container: HostElement) {
    const c1 = n1.children
    const c2 = n2.children

    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    // ---------------- 文本子节点 ----------------
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 如果新旧文本内容不同，直接更新
      if (c2 !== c1) {
        hostSetElementText(container, c2 as string)
      }
    }
    // ---------------- 数组子节点 ----------------
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 简化版：全量替换
      // TODO: 真实 Vue 会做 diff 优化，这里直接清空再挂载
      hostSetElementText(container, '') // 清空容器
      for (let i = 0; i < (c2 as VNodeArrayChildren).length; i++) {
        patch(null, (c2 as VNode[])[i], container)
      }
    }
  }

  /**
   * 对比旧属性和新属性，并更新 DOM
   *
   * @param el 宿主 DOM 元素
   * @param oldProps 旧属性对象
   * @param newProps 新属性对象
   */
  function patchProps(el: HostElement, oldProps: Record<string, any>, newProps: Record<string, any>) {
    // 1. 更新或添加新属性
    for (const key in newProps) {
      const prev = oldProps[key]
      const next = newProps[key]
      if (prev !== next) {
        hostPatchProp(el, key, prev, next)
      }
    }

    // 2. 删除被移除的旧属性
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  /**
   * @function processText
   * @description 处理文本节点（Text VNode）的挂载与更新逻辑。
   * 在 patch 阶段，当遇到 type === Text 的 VNode 时，会调用该函数。
   *
   * @param n1 旧的文本 VNode，如果是首次挂载则为 null。
   * @param n2 新的文本 VNode，包含 children（即文本内容）。
   * @param container 父容器 DOM 节点，用于插入文本节点。
   */
  const processText = (n1: VNode | null, n2: VNode, container: HostElement, anchor: HostElement | null = null) => {
    if (n1 == null) {
      // 挂载阶段：旧节点不存在
      // 使用宿主环境的创建文本节点 API 创建一个真实 DOM Text 节点
      n2.el = hostCreateText(n2.children as string)

      // 将创建好的文本节点插入到容器中指定位置
      hostInsert(n2.el, container, anchor)
    } else {
      // 更新阶段：已有旧节点
      // 复用旧的真实 DOM 节点
      const el = (n2.el = n1.el!)

      // 如果文本内容发生变化，则更新真实 DOM 的 textContent
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string)
      }
    }
  }

  /**
   * 挂载元素
   */
  function mountElement(vnode: VNode, container: HostElement, anchor: HostElement | null = null) {
    const el = (vnode.el = hostCreateElement(vnode.type as string))

    // 设置文本或 children
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = vnode.children as string
    }
    // 在编译时，children 不会是一个 vnode，而是一个数组，即使里面只有一个
    else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      ;(vnode.children as VNodeArrayChildren).forEach((child) => {
        // 标准化
        const _child = normalizeVNode(child)
        if (!_child) return

        patch(null, _child, el)
      })
    }

    // props 处理
    if (vnode.props) {
      patchProps(el, {}, vnode.props)
    }

    hostInsert(el, container, anchor)
  }

  /**
   * 处理组件 vnode
   */
  function processComponent(n1: VNode | null, n2: VNode, container: HostElement, anchor: HostElement | null = null) {
    if (!n1) {
      mountComponent(n2, container, anchor)
    } else {
      // TODO: 组件更新
      updateComponent(n1, n2)
    }
  }

  /**
   * 挂载组件
   */
  function mountComponent(initialVNode: VNode, container: HostElement, anchor: HostElement | null = null) {
    // 1. 创建组件实例
    const instance = (initialVNode.component = createComponentInstance(initialVNode))

    // 2. 初始化组件，执行 setup，得到 render
    setupComponent(instance)

    // 3. 建立渲染副作用
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  /**
   * 更新组件
   */
  function updateComponent(n1: VNode, n2: VNode) {
    // 复用旧的组件实例
    const instance = (n2.component = n1.component)!

    // 判断是否需要更新（props、slots 变化时）
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2 // 暂存新的 vnode
      instance.update() // 触发渲染副作用，进入更新逻辑
    } else {
      // 不需要更新时，直接复用 DOM
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  /**
   * 判断组件是否需要更新
   * @returns boolean
   */
  function shouldUpdateComponent(n1: VNode, n2: VNode): boolean {
    const prevProps = n1.props || {}
    const nextProps = n2.props || {}

    // 简化：只要 props 变了就更新
    for (const key in nextProps) {
      if (nextProps[key] !== prevProps[key]) {
        return true
      }
    }
    for (const key in prevProps) {
      if (!(key in nextProps)) {
        return true
      }
    }
    return false
  }

  /**
   * 渲染组件根
   */
  function renderComponentRoot(instance: ComponentInternalInstance): VNode {
    const { render, proxy } = instance
    return (render ? render.call(proxy, proxy) : null) as VNode
  }

  /**
   * 为组件创建渲染副作用：首次挂载 & 响应更新
   */
  function setupRenderEffect(
    instance: ComponentInternalInstance,
    initialVNode: VNode,
    container: HostElement,
    anchor: HostElement | null = null
  ) {
    /**
     * 组件的更新逻辑（首次挂载 + 更新时都会执行）
     */
    const componentUpdateFn = () => {
      const { next } = instance
      if (next) {
        // ----------------- 处理新 vnode -----------------
        // 1. 替换旧 vnode 的 DOM 引用
        next.el = instance.vnode.el
        instance.vnode = next
        instance.next = null

        // 2. 更新组件 props（将新的 vnode props 赋值到 instance.props）
        updateComponentPreRender(instance, next)
      }

      if (!instance.isMounted) {
        // ---------------- 首次挂载 ----------------

        // TODO: beforeMount 生命周期钩子
        // invokeArrayFns(instance.bm)

        // 1. 渲染组件，生成 vnode 子树
        const subTree = (instance.subTree = renderComponentRoot(instance))

        // 2. 挂载子树
        patch(null, subTree, container)
        // 3. 保存根元素引用
        initialVNode.el = subTree.el

        // TODO: mounted 生命周期钩子
        // queuePostRenderEffect(instance.m)
        instance.isMounted = true
      } else {
        // ---------------- 更新 ----------------

        // TODO: beforeUpdate 生命周期钩子
        // invokeArrayFns(instance.bu)

        // 1. 渲染新子树
        const nextTree = renderComponentRoot(instance)

        const prevTree = instance.subTree
        instance.subTree = nextTree
        // 2. Diff & 更新
        patch(prevTree, nextTree, container, anchor)
        // 3. 更新根元素引用
        instance.vnode.el = nextTree.el

        // TODO: updated 生命周期钩子
        // queuePostRenderEffect(instance.u)
      }
    }

    // ---------------- 创建渲染副作用 ----------------
    const effect = new ReactiveEffect(
      componentUpdateFn /* , () => {
      // 调度器：当依赖变化时，把更新任务放到队列中执行
      queueJob(instance.update)
    } */
    )

    // instance.update 就是组件的「更新函数」
    instance.update = effect.run.bind(effect)
    // 首次执行：直接触发一次挂载
    instance.update()
  }

  return {
    render,
  }
}

/**
 * 更新组件实例在渲染前的状态
 * @param instance 组件实例
 * @param next 新的 vnode
 */
function updateComponentPreRender(instance: ComponentInternalInstance, next: VNode) {
  // 1. 更新 vnode 引用
  instance.vnode = next
  instance.next = null

  // 2. 更新 props
  const { props } = next
  if (props) {
    // 将新的 vnode props 赋值给 instance.props
    instance.props = props
  }

  // 3. 可选：更新 slots，如果有 slots 变化
  // if (next.children) {
  //   instance.slots = next.children as any
  // }

  // 4. 其他需要在 render 前更新的状态可以在这里处理
}
