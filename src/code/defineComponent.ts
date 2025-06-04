import Vue, { type VueOptions } from './vue2/Vue'
import Watcher from './vue2/Watcher'

interface ComponentOptions extends VueOptions {
  template?: string
  components?: { [key: string]: Component }
  [key: string]: any
}

export class Component extends Vue<ComponentOptions> {
  constructor(options: ComponentOptions) {
    super(options)
  }

  /** 渲染 */
  public render(root: Element, replace?: true) {
    // 使用 Watcher 监听数据变化
    new Watcher(() => {
      let { template } = this.$options
      if (!template) return
      template = this.compileTemplate(template)
      template = this.compileClick(template)

      // 渲染视图组件不需要替换<router-view>节点
      if (!replace) {
        root.innerHTML = template.trim()
        this.bindClickEvents(root)
      }
      // 渲染子组件才需要替换节点
      else {
        // 用一个容器解析 template 字符串为 DOM
        const wrapper = document.createElement('div')
        wrapper.innerHTML = template.trim()
        this.bindClickEvents(wrapper)

        // 保存父节点和插入位置
        const parentNode = root.parentNode
        const nextSibling = root.nextSibling

        if (!parentNode) return
        // 删除原节点
        parentNode.removeChild(root)

        // 插入新节点（保持顺序）
        Array.from(wrapper.childNodes).forEach((node) => {
          parentNode.insertBefore(node, nextSibling)
        })
      }

      this.renderComponent(root)
    })
  }

  /** 渲染子组件 */
  private renderComponent(root: Element) {
    const { components } = this.$options
    if (!components) return

    // 遍历组件定义
    Object.entries(components).forEach(([key, component]) => {
      const els = root.querySelectorAll(key)
      els.forEach((el) => {
        component.render(el, true)
      })
    })
  }

  /** 解析模板 */
  // 实际上vue2中是使用编译器将模板转换为渲染函数，这里简化处理
  // AST（抽象语法树）和编译过程可以更复杂
  // TODO: 使用 AST 解析模板字符串
  private compileTemplate(template: string) {
    // 解析模板字符串，替换变量等
    // 这里可以使用简单的正则或更复杂的解析逻辑
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      // 同时能解析 a.b.c 这种嵌套属性
      const keys = key.split('.')
      const value = keys.reduce((obj, k) => {
        if (obj && obj[k] !== undefined) {
          return obj[k]
        }
        return undefined
      }, this._data)
      return value !== undefined ? value : ''
    })
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
      const method = this.$options.methods?.[methodName]
      if (typeof method === 'function') {
        el.addEventListener('click', method.bind(this))
      }
      // 清理属性
      el.removeAttribute('data-onclick')
    })
  }
}

function defineComponent(options: ComponentOptions): Component {
  return new Component(options)
}

export default defineComponent
