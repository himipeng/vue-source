/**
 * ShapeFlags 用来标记 VNode 的类型以及其 children 的类型。
 *
 * Vue 内部通过位运算（`&`、`|`）快速判断节点的特征，
 * 这样渲染器可以根据不同类型走不同的挂载/更新逻辑。
 */
export enum ShapeFlags {
  /**
   * 普通 DOM 元素
   * e.g. <div>, <span>
   */
  ELEMENT = 1,

  /**
   * 函数组件
   * e.g. const MyComp = () => h('div', 'hi')
   */
  FUNCTIONAL_COMPONENT = 1 << 1, // 2

  /**
   * 有状态组件（即带 data/setup/render 的组件实例）
   * e.g. defineComponent({ setup() { ... } })
   */
  STATEFUL_COMPONENT = 1 << 2, // 4

  /**
   * 子节点是纯文本
   * e.g. h('div', 'hello')
   */
  TEXT_CHILDREN = 1 << 3, // 8

  /**
   * 子节点是一个数组（多个子节点）
   * e.g. h('ul', [h('li'), h('li')])
   */
  ARRAY_CHILDREN = 1 << 4, // 16

  /**
   * 子节点是插槽（slots）
   * e.g. <MyComp><template #default>...</template></MyComp>
   */
  SLOTS_CHILDREN = 1 << 5, // 32

  /**
   * Teleport 特殊组件
   * e.g. <teleport to="body"><div/></teleport>
   */
  TELEPORT = 1 << 6, // 64

  /**
   * Suspense 特殊组件
   * e.g. <Suspense><template #default>...</template></Suspense>
   */
  SUSPENSE = 1 << 7, // 128

  /**
   * keep-alive 组件标记：组件应该被缓存
   */
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 256

  /**
   * keep-alive 组件标记：组件已经被缓存（处于激活状态）
   */
  COMPONENT_KEPT_ALIVE = 1 << 9, // 512

  /**
   * 组件类型的统一标记：包括函数式组件和有状态组件
   * 用于快速判断是否是“组件”。
   */
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 6
}
