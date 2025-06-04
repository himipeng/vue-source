import Vue, { type VueOptions } from './vue2/Vue'

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
    const { template } = this.$options
    if (!template) return

    // 渲染视图组件不需要替换<router-view>节点
    if (!replace) {
      root.innerHTML = template.trim()
    }
    // 渲染子组件才需要替换节点
    else {
      // 用一个容器解析 template 字符串为 DOM
      const wrapper = document.createElement('div')
      wrapper.innerHTML = template.trim()

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
}

function defineComponent(options: ComponentOptions): Component {
  return new Component(options)
}

export default defineComponent
