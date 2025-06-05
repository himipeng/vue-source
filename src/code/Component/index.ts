import Vue, { type VueOptions } from '../vue2/Vue'
import Watcher from '../vue2/Watcher'
import Compiler from './compiler'

export interface ComponentOptions extends VueOptions {
  name?: string
  template?: string
  components?: { [key: string]: ComponentOptions }
}

export default class Component extends Vue<ComponentOptions> {
  /** 观察者 */
  private watcher: Watcher | null = null
  /** 挂载节点 */
  public _el?: Element
  /** 子组件实例 */
  private _childrenMap = new Map<string, Component>()

  constructor(public options: ComponentOptions) {
    super(options)
  }

  public mount(el: Element) {
    this._el = el
    const compiler = new Compiler(this)

    if (!this.watcher) {
      this.watcher = new Watcher(() => {
        // 渲染本组件
        compiler.update()
        // 渲染子组件
        this.renderComponent(el)
      })
    }
  }

  /** 渲染子组件 */
  private renderComponent(root: Element) {
    const { components } = this.$options

    if (!components) return
    // 遍历组件定义
    Object.entries(components).forEach(([tag, componentOptions]) => {
      const els = root.querySelectorAll(tag)

      els.forEach((el, inx) => {
        // 使用缓存，避免每次都重新实例化子组件
        const key = `${tag}-${inx}`
        let child = this._childrenMap.get(key)
        if (!child) {
          child = new Component(componentOptions)
          this._childrenMap.set(key, child)
        }
        child.mount(el)
      })
    })
  }
}
