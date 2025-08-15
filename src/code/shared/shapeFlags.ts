/**
 * ShapeFlags 枚举
 * 用于标记 VNode 的类型以及子节点类型，便于运行时快速判断
 */
export enum ShapeFlags {
  /** 普通元素节点，如 div、span */
  ELEMENT = 1, // 0001
  /** 子节点为文本类型 */
  TEXT_CHILDREN = 1 << 1, // 0010
  /** 子节点为数组类型 */
  ARRAY_CHILDREN = 1 << 2, // 0100
  /** 组件类型节点 */
  COMPONENT = 1 << 3, // 1000
}
