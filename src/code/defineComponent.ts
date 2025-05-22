interface ComponentOptions {
  template?: string
  [key: string]: any
}

export class Component {
  private options

  constructor(options: ComponentOptions) {
    this.options = options
  }

  public render(root: Element) {
    const { template } = this.options
    template && (root.innerHTML = template)
  }
}

function defineComponent(options: ComponentOptions): Component {
  return new Component(options)
}

export default defineComponent
