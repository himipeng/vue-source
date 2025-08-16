/**
 * VNode 对象类型，表示虚拟节点的结构和属性。
 * 用于描述组件或元素的虚拟表示，便于渲染和更新。
 */
export interface VNode {
  /** 标识该对象是一个 VNode */
  __v_isVNode: true
  /** 节点类型，可以是 HTML 标签名字符串或组件对象 */
  type: string | object
  /** 节点的属性对象，包含所有传递给该节点的 props */
  props: Record<string, any> | null
  /** 节点的唯一标识 key，用于优化渲染 */
  key?: string | number | null
  /** 子节点，可以是字符串、单个 VNode 或 VNode 数组 */
  children: any
  /** 节点形状标记，用于描述节点类型和子节点类型 */
  shapeFlag: number
  /** Patch 标记，用于标识该节点在更新时需要优化的部分 */
  patchFlag: number
  /** 动态属性列表，仅包含需要动态更新的属性名 */
  dynamicProps: string[] | null
  /** 动态子节点列表，用于跟踪需要动态更新的子节点 */
  dynamicChildren: VNode[] | null
  /** 真实 DOM 元素的引用，渲染后指向对应的 HTMLElement */
  el: HTMLElement | null
  /** 上下文对象，通常绑定当前组件实例 */
  ctx: any
}

type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren

export type RenderFunction = (_ctx?: object, _cache?: any) => VNodeChild
