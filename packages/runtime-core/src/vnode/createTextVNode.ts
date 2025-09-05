import type { VNode } from '../types'
import { createVNode } from './createVNode'
import type { PatchFlags } from '@vue/shared'

// 特殊 VNode 类型标识文本节点
export const Text = Symbol('Text')

/**
 * 创建文本 VNode
 * @param text 文本内容，默认单空格 `' '`，避免空文本引起的渲染问题
 * @param flag PatchFlag，用于标记动态文本，默认为 0
 * @returns 文本类型 VNode
 */
export function createTextVNode(text: string = ' ', flag: PatchFlags | 0 = 0): VNode {
  // 直接调用 createVNode，type 为 Text
  return createVNode(Text, null, text, flag)
}
