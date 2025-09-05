import type { ComponentOptions } from '../types/component'
import Observer from '../Observer'

class Vue<T extends ComponentOptions = ComponentOptions> {
  _data: Record<string, any> = {}
  protected $options: T

  constructor($options: T) {
    this.$options = $options || {}
    this.initData()
  }

  /** 数据初始化 */
  initData() {
    let data = this.$options.data
    if (!data) return

    // 将 data 存放到 _data 中
    data = this._data = typeof data === 'function' ? (data as (() => Record<string, any>)).call(this) : data

    // 数据代理：将 _data 中的属性代理到 Vue 实例上
    for (let key in data) {
      this.proxy(this, `_data`, key)
    }

    // 数据劫持核心：观察 data
    this.observe(data)
  }

  /** 数据代理 */
  private proxy(target, sourceKey: string, key: string) {
    Object.defineProperty(target, key, {
      get() {
        return target[sourceKey][key]
      },
      set(val) {
        target[sourceKey][key] = val
      },
    })
  }

  /** 数据劫持 */
  private observe(value: any) {
    if (typeof value !== 'object' || value === null) return
    new Observer(value)
  }
}

export default Vue
