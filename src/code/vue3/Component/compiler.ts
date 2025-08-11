import Component from '.'
import { toDisplayString, toRaw } from '../utils'

export default class Compiler {
  /** 记录所有绑定点（文本节点位置） */
  private _bindings: Map<string, HTMLElement[]> = new Map()
  /** 子组件实例缓存，避免重复创建 */
  private _childInstances: Map<Element, Component> = new Map()
  /** 是否已渲染 */
  private _hasRendered = false

  constructor(private instance: Component) {}

  public renderTemplate() {
    const el = this.instance._el
    const template = this.instance.options.template
    if (!el || !template) return

    if (!this._hasRendered) {
      // 首次渲染，编译模板并挂载
      this.compileTemplate(template, el)
      this.scanBindings(el)
      this._hasRendered = true
    }

    this.mountChildComponents()
    this.updateBindings()
  }

  private compileTemplate(template: string, el: Element) {
    // 首次渲染，清空内容
    el.innerHTML = ''

    // 替换 {{ xxx }} 插值
    let html = template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      return `<span data-bind="${key}"></span>`
    })

    // 事件指令处理（如 @click）
    html = html.replace(/@click="(\w+)"/g, (_, method) => {
      return `data-click="${method}"`
    })

    el.innerHTML = html.trim()

    // 绑定 click 事件
    const clickElements = el.querySelectorAll('[data-click]')
    clickElements.forEach((btn) => {
      const methodName = btn.getAttribute('data-click')!
      const method = this.instance[methodName]
      if (typeof method === 'function') {
        btn.addEventListener('click', method)
      }
    })
  }

  /** 遍历子组件标签并挂载每一个子组件 */
  private mountChildComponents() {
    const root = this.instance._el
    const components = this.instance.options.components
    if (!root || !components) return

    Object.entries(components).forEach(([tag, options]) => {
      const nodes = root.querySelectorAll(tag)
      nodes.forEach((el) => {
        let child = this._childInstances.get(el)
        if (!child) {
          // 实例化并缓存子组件
          child = new Component(options)
          this._childInstances.set(el, child)
        }
        child.mount(el)
      })
    })
  }

  /** 记录绑定点 */
  private scanBindings(root: Element) {
    this._bindings.clear()
    const els = root.querySelectorAll('[data-bind]')
    els.forEach((el) => {
      const key = el.getAttribute('data-bind')!
      if (!this._bindings.has(key)) {
        this._bindings.set(key, [])
      }
      this._bindings.get(key)!.push(el as HTMLElement)
      // 清理属性
      el.removeAttribute('data-bind')
    })
  }

  /** 替换绑定点内容 */
  private updateBindings() {
    for (const [key, els] of this._bindings.entries()) {
      const keys = key.split('.')
      const value = keys.reduce((obj, k) => {
        return obj && obj[k]
      }, this.instance)
      const text = value !== undefined ? toRaw(value) : ''
      els.forEach((el) => {
        el.textContent = toDisplayString(text)
      })
    }
  }
}
