import type Component from '.'

/**
 * 用于编译模板(vue2是用编译器将模板转换为渲染函数，这里简化处理)
 */
export default class Compiler {
  /** 记录所有绑定点（文本节点位置） */
  private _bindings: Map<string, HTMLElement[]> = new Map()
  /** 是否已渲染 */
  private _hasRendered = false

  constructor(private $component: Component) {}

  public update() {
    let { template } = this.$component.options
    const el = this.$component._el
    if (!el || !template) return

    // 如果是第一次渲染，就构造模板
    if (!this._hasRendered) {
      template = this.compileTemplate(template)
      const html = this.compileClick(template)
      el.innerHTML = html.trim()
      this.bindClickEvents(el)
      this.scanBindings(el)
      this._hasRendered = true
    }

    // 每次都 patch 插值值
    this.patchBindings()
  }

  /** 编译模板 */
  // 把插值 {{ xxx }} 替换为 标记节点
  // 实际上vue2中是使用编译器将模板转换为渲染函数，这里简化处理
  // AST（抽象语法树）和编译过程可以更复杂
  // TODO: 使用 AST 解析模板字符串
  private compileTemplate(template: string) {
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      return `<span data-bind="${key}"></span>`
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
  private patchBindings() {
    for (const [key, els] of this._bindings.entries()) {
      const keys = key.split('.')
      const value = keys.reduce((obj, k) => (obj && k in obj ? obj[k] : undefined), this.$component)
      const text = value !== undefined ? value : ''
      els.forEach((el) => {
        el.textContent = String(text)
      })
    }
  }

  /** 解析点击事件 */
  // 实际上vue2中是使用编译器将模板转换为渲染函数，这里简化处理
  // TODO: 使用 AST 解析模板字符串
  private compileClick(template: string) {
    // 解析 @click="methodName" 事件绑定
    return template.replace(/@click="([^"]+)"/g, (_, methodName) => {
      return `data-onclick="${methodName}"`
    })
  }

  /** 绑定点击事件 */
  private bindClickEvents(root: Element) {
    const elements = root.querySelectorAll('[data-onclick]')

    elements.forEach((el) => {
      const methodName = el.getAttribute('data-onclick')
      if (!methodName) return
      const method = this.$component.options.methods?.[methodName]

      if (typeof method === 'function') {
        el.addEventListener('click', method.bind(this.$component))
      }
      // 清理属性
      el.removeAttribute('data-onclick')
    })
  }
}
