import type { VNode } from '@/types/runtime-core'
import { ShapeFlags } from '../shared'

/**
 * 创建一个虚拟节点（VNode）对象，表示一个元素或组件。
 * 该函数用于构建渲染过程中的虚拟 DOM 结构。
 *
 * @param type - 节点类型，可以是 HTML 标签字符串（如 'div'）或组件对象。
 * @param props - 节点的属性对象，包含所有传递给该节点的属性和事件等。
 * @param children - 节点的子节点，可以是字符串（文本节点）、单个 VNode 或 VNode 数组。
 * @param patchFlag - Patch 标记，用于标识该节点需要动态更新的部分，优化渲染性能。
 * @param dynamicProps - 动态属性名称数组，标记哪些属性是需要动态更新的。
 * @param shapeFlag - 节点形状标记，默认标记为 ELEMENT，可用于区分节点类型。
 * @returns 返回构建好的 VNode 对象，包含节点的所有信息。
 *
 * @example
 * ```ts
 * const vnode = createElementVNode('div', { id: 'app' }, 'Hello World', PatchFlags.TEXT);
 * ```
 */
export function createElementVNode(
  type: string | object,
  props: Record<string, any> | null = null,
  children: any = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null,
  shapeFlag: number = ShapeFlags.ELEMENT
): VNode {
  // 创建基础 VNode 对象，初始化各个字段
  const vnode: VNode = {
    __v_isVNode: true,
    type,
    props,
    // 从 props 中提取 key，方便渲染时的节点比对和复用
    key: props && (props.key ?? null),
    children,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    el: null,
    ctx: null, // 上下文绑定，通常用于关联当前组件实例
  }

  // 根据 children 类型，更新 shapeFlag 标记，区分文本或数组子节点
  if (children) {
    vnode.shapeFlag |=
      typeof children === 'string' ? ShapeFlags.TEXT_CHILDREN : Array.isArray(children) ? ShapeFlags.ARRAY_CHILDREN : 0
  }

  return vnode
}
