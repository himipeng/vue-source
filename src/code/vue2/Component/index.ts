import Vue from './Vue'
import Watcher from '../Watcher'
import Compiler from './compiler'
import type { ComponentOptions } from '../../../types/component'

export default class Component extends Vue {
  /** 观察者 */
  private watcher: Watcher | null = null
  /** 挂载节点 */
  public _el?: Element
  /** 子组件实例 */
  private _childrenMap = new Map<Element, Component>()

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

      els.forEach((el) => {
        // 使用缓存，避免每次都重新实例化子组件
        let child = this._childrenMap.get(el)
        if (!child) {
          child = new Component(componentOptions)
          this._childrenMap.set(el, child)
        }
        child.mount(el)
      })
    })
  }
}
