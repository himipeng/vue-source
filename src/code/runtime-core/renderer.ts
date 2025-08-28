import type {
  ComponentInternalInstance,
  RendererNode,
  VNode,
  VNodeArrayChildren,
  VNodeChild,
} from '@vue/types/runtime-core'
import { createVNode, Text, Comment } from '@vue/runtime-core'
import { ShapeFlags } from '@vue/shared'
import { createComponentInstance, setupComponent } from './component'
import { ReactiveEffect } from '@vue/reactivity'
import { queueJob } from '@vue/reactivity/scheduler'

/**
 * RendererOptions 表示渲染器操作宿主环境的 API
 */
export interface RendererOptions<HostElement = any, HostText = any> {
  insert: (child: HostElement | HostText, parent: HostElement, anchor?: HostElement | null) => void
  remove: (child: HostElement | HostText) => void
  createElement: (tag: string) => HostElement
  createComment: (text: string) => HostText
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

export function createRenderer<HostElement = RendererNode>(options: RendererOptions): Renderer {
  const {
    createText: hostCreateText,
    insert: hostInsert,
    setText: hostSetText,
    createElement: hostCreateElement,
    createComment: hostCreateComment,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
    remove: hostRemove,
  } = options

  /**
   * 渲染入口
   * @param vnode VNode 或 null
   * @param container 宿主容器
   */
  function render(vnode: VNode | null, container: HostElement) {
    if (vnode == null) {
      // // 如果 vnode 为 null，卸载容器中的内容
      if ((container as RendererNode)._vnode) {
        unmount((container as RendererNode)._vnode)
      }
    } else {
      // patch(container._vnode || null, vnode, container)
      patch(null, vnode, container)
    }
    ;(container as RendererNode)._vnode = vnode
  }

  /**
   * 对比新旧 VNode 并更新
   * @param n1 旧节点
   * @param n2 新节点k0
   * @param container 容器
   * @param anchor 参照节点,用于 确定新节点插入的位置,为null时插入到结尾
   * @param parentComponent 父组件实例
   */
  function patch(
    n1: VNode | null,
    n2: VNode,
    container: HostElement,
    anchor: HostElement | null = null,
    parentComponent?: ComponentInternalInstance
  ) {
    if (n1 === n2) return

    // 卸载节点
    if (n1 && n1.type !== n2.type) {
      // 类型不同直接卸载旧节点
      unmount(n1, parentComponent)
      n1 = null
    }

    const { type, shapeFlag } = n2
    switch (type) {
      // TODO: 处理其他类型
      case Text:
        processText(n1, n2, container, anchor)
        break
      case Comment:
        processCommentNode(n1, n2, container, anchor)
        break
      // 处理原生元素或组件
      default:
        // 原生元素
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent)
        }
        // 组件
        else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor, parentComponent)
        }
    }
  }

  /**
   * 处理元素 vnode
   */
  function processElement(
    n1: VNode | null,
    n2: VNode,
    container: HostElement,
    anchor: HostElement | null = null,
    parentComponent?: ComponentInternalInstance
  ) {
    if (!n1) {
      mountElement(n2, container, anchor, parentComponent)
    } else {
      patchElement(n1, n2, parentComponent)
    }
  }

  /**
   * 处理空节点
   */
  function processCommentNode(n1: VNode | null, n2: VNode, container: HostElement, anchor: HostElement | null = null) {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateComment((n2.children as string) || '')), container, anchor)
    } else {
      n2.el = n1.el
    }
  }

  /**
   * 对比两个元素 VNode，并更新真实 DOM
   *
   * @param n1 旧的 VNode
   * @param n2 新的 VNode
   */
  function patchElement(n1: VNode, n2: VNode, parentComponent?: ComponentInternalInstance) {
    // 复用旧节点的真实 DOM 元素
    const el = (n2.el = n1.el!)

    // 获取旧属性与新属性
    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    // 更新子节点
    patchChildren(n1, n2, el as HostElement, null, parentComponent)

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
  function patchChildren(
    n1: VNode,
    n2: VNode,
    container: HostElement,
    anchor: HostElement | null = null,
    parentComponent?: ComponentInternalInstance
  ) {
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
        patch(null, (c2 as VNode[])[i], container, null, parentComponent)
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
  function patchProps(
    el: HostElement,
    oldProps: Record<string, any>,
    newProps: Record<string, any>,
    parentComponent?: ComponentInternalInstance | null
  ) {
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
  function mountElement(
    vnode: VNode,
    container: HostElement,
    anchor: HostElement | null = null,
    parentComponent?: ComponentInternalInstance
  ) {
    const el = (vnode.el = hostCreateElement(vnode.type as string))

    // 设置文本或 children
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = vnode.children as string
    }
    // 在编译时，children 不会是一个 vnode，而是一个数组，即使里面只有一个
    else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children as VNodeArrayChildren, el, null, parentComponent)
    }

    // props 处理
    if (vnode.props) {
      patchProps(el, {}, vnode.props)
    }

    hostInsert(el, container, anchor)
  }

  /**
   * 挂载子节点
   */
  function mountChildren(
    children: VNodeArrayChildren,
    container: HostElement,
    anchor: HostElement | null = null,
    parentComponent?: ComponentInternalInstance
  ) {
    for (let i = 0; i < children.length; i++) {
      // 标准化
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor, parentComponent)
    }
  }

  /**
   * 处理组件 vnode
   */
  function processComponent(
    n1: VNode | null,
    n2: VNode,
    container: HostElement,
    anchor: HostElement | null = null,
    parentComponent?: ComponentInternalInstance
  ) {
    if (!n1) {
      mountComponent(n2, container, anchor, parentComponent)
    } else {
      // TODO: 组件更新
      updateComponent(n1, n2)
    }
  }

  /**
   * 挂载组件
   */
  function mountComponent(
    initialVNode: VNode,
    container: HostElement,
    anchor: HostElement | null = null,
    parentComponent?: ComponentInternalInstance
  ) {
    // 1. 创建组件实例
    const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent))

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
    const result = render ? render.call(proxy, proxy) : null
    return normalizeVNode(result)
  }

  function normalizeVNode(vnode: VNodeChild): VNode {
    if (vnode == null || typeof vnode === 'boolean') {
      // 生成空节点
      return createVNode(Comment) // 创建 Comment VNode
    } else if (typeof vnode === 'string' || typeof vnode === 'number') {
      return createVNode(Text, null, String(vnode))
    }
    // TODO: 其他类型
    return vnode as VNode
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
        patch(null, subTree, container, anchor, instance)
        // 3. 保存根元素引用
        initialVNode.el = subTree?.el || null

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
        // TODO anchor 可能偏移
        patch(prevTree, nextTree, container, null, instance)
        // 3. 更新根元素引用
        instance.vnode.el = nextTree?.el || null

        // TODO: updated 生命周期钩子
        // queuePostRenderEffect(instance.u)
      }
    }

    // ---------------- 创建渲染副作用 ----------------
    const effect = new ReactiveEffect(componentUpdateFn)
    // 加入异步调度
    const job = () => effect.run()
    effect.scheduler = () => queueJob(job)

    // instance.update 就是组件的「更新函数」
    instance.update = effect.run.bind(effect)
    // 首次执行：直接触发一次挂载
    instance.update()
  }

  /**
   * 卸载 VNode
   * @param vnode 要卸载的虚拟节点
   * @param parentComponent 父组件实例，可选
   * @param doRemove 是否从 DOM 移除元素
   */
  function unmount(vnode: VNode, parentComponent?: ComponentInternalInstance, doRemove = true) {
    const { type, children, shapeFlag } = vnode

    // 处理 ref
    // if (ref != null) {
    //   setRef(ref, null, undefined, vnode, true)
    // }

    // 卸载组件
    if (shapeFlag & ShapeFlags.COMPONENT) {
      unmountComponent(vnode.component!)
    }

    // 卸载子节点
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(children as VNode[], parentComponent)
    }

    // Fragment 类型的子节点
    // if (type === Fragment) {
    //   ;(children as VNode[]).forEach((child) => unmount(child, parentComponent))
    // }

    // 移除 DOM
    if (doRemove && vnode.el) {
      remove(vnode)
    }
  }

  /**
   * 卸载组件实例
   */
  function unmountComponent(instance: ComponentInternalInstance) {
    // 卸载子组件的 subTree
    if (instance.subTree) {
      unmount(instance.subTree, instance)
    }
    // 清空实例关联
    instance.isUnmounted = true
  }

  /**
   * 卸载子节点
   */
  function unmountChildren(children: VNode[], parentComponent?: ComponentInternalInstance) {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i], parentComponent)
    }
  }

  function remove(vnode: VNode) {
    hostRemove(vnode.el!)
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
