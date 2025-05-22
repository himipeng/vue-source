interface ComponentOptions {
  template?: string
  components?: { [key: string]: Component }
  [key: string]: any
}

export class Component {
  private options

  constructor(options: ComponentOptions) {
    this.options = options
  }

  public render(root: Element, replace?: true) {
    const { template } = this.options
    if (!template) return

    if (!replace) {
      root.innerHTML = template.trim()
    } else {
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

  private renderComponent(root: Element) {
    const { components } = this.options
    if (!components) return

    Object.entries(components).forEach(([key, component]) => {
      console.log(key, component)
      const els = root.querySelectorAll(key)
      console.log(els)

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
