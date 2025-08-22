/**
 * DOM 平台的节点操作集合
 * 提供给 renderer 用于创建、更新和删除真实 DOM 节点
 */

/**
 * 插入节点
 * @param child 要插入的子节点
 * @param parent 父节点
 * @param anchor 参照节点，如果传入则插入到该节点之前，否则追加到末尾
 */
export function insert(child: Node, parent: Node, anchor: Node | null = null): void {
  parent.insertBefore(child, anchor)
}

/**
 * 删除节点
 * @param child 要删除的子节点
 */
export function remove(child: Node): void {
  const parent = child.parentNode
  if (parent) parent.removeChild(child)
}

/**
 * 创建元素节点
 * @param tag 元素标签名，例如 'div'、'span'
 * @returns 新创建的元素
 */
export function createElement(tag: string): Element {
  return document.createElement(tag)
}

/**
 * 创建文本节点
 * @param text 文本内容
 * @returns 新创建的文本节点
 */
export function createText(text: string): Text {
  return document.createTextNode(text)
}

/**
 * 设置文本节点的内容
 * @param node 文本节点
 * @param text 要设置的文本内容
 */
export function setText(node: Text, text: string): void {
  node.nodeValue = text
}

/**
 * 设置元素的文本内容
 * @param el 元素节点
 * @param text 要设置的文本内容
 */
export function setElementText(el: Element, text: string): void {
  el.textContent = text
}
