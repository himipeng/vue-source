export * from './createVNode'
export * from './createElementVNode'
export * from './createTextVNode'
export * from './resolveComponent'
export { toDisplayString } from '@vue/shared'

/**
 * 用于模板插值表达式，将值转换为字符串显示
 */
export const TO_DISPLAY_STRING: unique symbol = Symbol('toDisplayString')

/**
 * 用于运行时解析组件对象，在 render 阶段根据组件名返回组件实例或对象
 */
export const RESOLVE_COMPONENT: unique symbol = Symbol('resolveComponent')

/**
 * 用于创建虚拟节点 VNode，相当于 Vue 的 h()
 */
export const CREATE_VNODE: unique symbol = Symbol('createVNode')

/**
 * 用于创建普通元素的虚拟节点
 */
export const CREATE_ELEMENT_VNODE: unique symbol = Symbol('createElementVNode')

/**
 * 用于创建文本元素的虚拟节点
 */
export const CREATE_TEXT: unique symbol = Symbol('createTextVNode')

/**
 * Runtime helper 映射
 * 用于 Codegen 阶段生成渲染函数时，将 helper Symbol 映射为字符串名称
 * 方便生成 `_helperName()` 调用或解构 const { _helperName } = Vue
 */
export const helperNameMap: Record<symbol, string> = {
  [TO_DISPLAY_STRING]: 'toDisplayString',
  [RESOLVE_COMPONENT]: 'resolveComponent',
  [CREATE_VNODE]: 'createVNode',
  [CREATE_ELEMENT_VNODE]: 'createElementVNode',
  [CREATE_TEXT]: 'createTextVNode',
}
