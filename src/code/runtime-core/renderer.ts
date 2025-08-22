import type { ComponentInternalInstance, VNode, VNodeArrayChildren, VNodeChild } from '@/types/runtime-core'
import { Text } from '@vue/runtime-core'
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
  patchProp?: (el: HostElement, key: string, prevValue: any, nextValue: any) => void
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

function normalizeVNode(child: VNodeChild): VNode {
  // TODO 标准化
  return child as VNode
}

/**
 * 宿主环境中的父节点
 */
export interface RendererNode {
  [key: string | symbol]: any
}

export function createRenderer<HostElement extends RendererNode>(options: RendererOptions): Renderer {
  const {
    createText: hostCreateText,
    insert: hostInsert,
    setText: hostSetText,
    createElement: hostCreateElement,
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
   */
  function patch(n1: VNode | null, n2: VNode, container: HostElement) {
    if (n1 === n2) return

    // TODO: 卸载节点
    if (n1 && n1.type !== n2.type) {
      // 类型不同直接卸载旧节点
      // unmount(n1)
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
  function processElement(n1: VNode | null, n2: VNode, container: HostElement) {
    if (!n1) {
      mountElement(n2, container)
    } else {
      // TODO: diff 更新
      // const el = n2.el = n1.el!
      // patchProps(el, n1.props, n2.props)
      // patchChildren(n1, n2, el)
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
  const processText = (n1: VNode | null, n2: VNode, container: HostElement) => {
    if (n1 == null) {
      // 挂载阶段：旧节点不存在
      // 使用宿主环境的创建文本节点 API 创建一个真实 DOM Text 节点
      n2.el = hostCreateText(n2.children as string)

      // 将创建好的文本节点插入到容器中指定位置
      hostInsert(n2.el, container)
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
  function mountElement(vnode: VNode, container: HostElement) {
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
      for (const key in vnode.props) {
        const value = vnode.props[key]

        // TODO： 处理多种属性
        if (key.startsWith('on') && typeof value === 'function') {
          const eventName = key.slice(2).toLowerCase()
          el.addEventListener(eventName, value)
        } else {
          el.setAttribute(key, value)
        }
      }
    }

    container.appendChild(el)
  }

  /**
   * 处理组件 vnode
   */
  function processComponent(n1: VNode | null, n2: VNode, container: HostElement) {
    if (!n1) {
      mountComponent(n2, container)
    } else {
      // TODO: 组件更新
      // updateComponent(n1, n2)
    }
  }

  /**
   * 挂载组件
   */
  function mountComponent(initialVNode: VNode, container: HostElement) {
    // 1. 创建组件实例
    const instance = (initialVNode.component = createComponentInstance(initialVNode))

    // 2. 初始化组件，执行 setup，得到 render
    setupComponent(instance)

    // 3. 建立渲染副作用
    setupRenderEffect(instance, initialVNode, container)
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
  function setupRenderEffect(instance: ComponentInternalInstance, initialVNode: VNode, container: HostElement) {
    /**
     * 组件的更新逻辑（首次挂载 + 更新时都会执行）
     */
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        // ---------------- 首次挂载 ----------------

        // TODO: beforeMount 生命周期钩子
        // invokeArrayFns(instance.bm)

        // 1. 渲染组件，生成 vnode 子树
        const subTree = (instance.subTree = renderComponentRoot(instance))

        console.log('vnode', subTree)

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
        patch(prevTree, nextTree, container)
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
