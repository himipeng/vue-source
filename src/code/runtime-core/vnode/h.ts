import { createVNode } from './createVNode'
import type { ComponentOptions, VNode } from '@vue/types/runtime-core'

/**
 * h 函数
 * 作用：让用户更方便地创建 VNode
 */
export function h(
  type: string | symbol | ComponentOptions,
  propsOrChildren?: Record<string, any> | VNode[] | string,
  children?: VNode[] | string
): VNode {
  const l = arguments.length

  // 只有 type
  if (l === 1) {
    return createVNode(type)
  }
  // 两个参数
  else if (l === 2) {
    // 如果第二个参数是对象，且不是数组 => props
    if (typeof propsOrChildren === 'object' && !Array.isArray(propsOrChildren)) {
      return createVNode(type, propsOrChildren)
    }
    // 如果是数组或字符串 => children
    else {
      return createVNode(type, null, propsOrChildren)
    }
  }
  // 三个参数 => props + children
  else {
    return createVNode(type, propsOrChildren as Record<string, any>, children)
  }
}
