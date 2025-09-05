/**
 * 更新宿主元素的属性/事件/样式等
 *
 * @param el 宿主元素 (DOM 元素)
 * @param key 属性名 (class/style/onClick/自定义 attr 等)
 * @param prevValue 旧值，用于对比是否需要更新或移除
 * @param nextValue 新值，用于设置到 DOM 上
 */
export function patchProp(el: Element, key: string, prevValue: any, nextValue: any): void {
  // 1. class
  if (key === 'class') {
    /**
     * class 特殊处理，直接赋值给 el.className
     * - 如果 newValue 为空则置空字符串
     */
    el.className = nextValue || ''
  }

  // 2. style
  else if (key === 'style') {
    /**
     * style 是一个对象，需要逐个属性设置
     * - 新样式直接覆盖
     * - 旧样式有但新样式没有的要清空
     */
    const style = (el as HTMLElement).style
    if (nextValue) {
      for (const k in nextValue) {
        style[k as any] = nextValue[k]
      }
    }
    if (prevValue) {
      for (const k in prevValue) {
        if (!nextValue || !(k in nextValue)) {
          style[k as any] = ''
        }
      }
    }
  }

  // 3. 事件 onXxx
  else if (/^on[A-Z]/.test(key)) {
    /**
     * 事件绑定 (例如 onClick -> click)
     * - 先移除旧的监听器
     * - 再绑定新的监听器
     */
    const eventName = key.slice(2).toLowerCase()
    if (prevValue) {
      el.removeEventListener(eventName, prevValue)
    }
    if (nextValue) {
      el.addEventListener(eventName, nextValue)
    }
  }

  // 4. 普通属性/attribute
  else {
    /**
     * 普通属性：直接通过 setAttribute 设置
     * - 如果 newValue 是 null/false -> 移除属性
     * - 否则更新为新值
     */
    if (nextValue == null || nextValue === false) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextValue)
    }
  }
}
