import type { ComponentOptions } from '@/types/component'
import Compiler from './compiler'
import { effect } from './effect'
import { proxyRefs } from './proxyRefs'

/** 简化版 Vue 3 组件实现 */
export default class Component {
  /** 通过 setup() 返回并经过 proxyRefs 包装的响应式状态 */
  public setupState: Record<string, any> = {}
  /** 编译器实例，用于处理模板和绑定 */
  private _compiler: Compiler | null = null
  /** 当前组件挂载的根 DOM 元素 */
  public _el?: Element

  constructor(public options: ComponentOptions) {
    const { setup } = options

    if (typeof setup === 'function') {
      // 执行 setup 函数，获取返回值（ref、方法等）
      const setupResult = setup()
      // proxyRefs 自动解包 ref.value（仅限模板或 this 访问）
      this.setupState = proxyRefs(setupResult)
    } else {
      // 无 setup 场景
      // 保持空对象，避免访问时报错
      this.setupState = {}
    }

    // 返回一个代理对象，实现 this.xxx 的访问重定向
    return this.initProxy()
  }

  /** 组件挂载函数：挂载到真实 DOM，并建立响应系统 */
  public mount(el: Element) {
    this._el = el
    if (!el || !this.options.template) return

    // 创建编译器实例，处理模板插值与事件绑定
    this._compiler = new Compiler(this)

    // 使用响应式 effect 包裹更新逻辑
    // TODO： 缺少深度响应式处理
    effect(() => {
      this._compiler!.renderTemplate()
    })
  }

  /**
   * 构造一个 Proxy，模拟 Vue 3 的组件代理对象行为：
   * - 访问 this.xxx 优先读取 setupState（也可以扩展支持 data、props）
   * - 返回的是代理对象自身，从而保证外部访问是统一入口
   */
  private initProxy() {
    return new Proxy(this, {
      get(target, key: string) {
        if (key in target.setupState) {
          return target.setupState[key]
        }
        // 可拓展支持 _data（选项式 API）
        // else if (key in target._data) {
        //   return target._data[key]
        // }
        return target[key]
      },
      set(target, key: string, value: any) {
        if (key in target.setupState) {
          target.setupState[key] = value
        }
        // else if (key in target._data) {
        //   target._data[key] = value
        // }
        else {
          target[key] = value
        }
        return true
      },
    })
  }
}
