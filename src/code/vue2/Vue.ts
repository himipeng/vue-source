import Observer from './Observer'

export interface VueOptions {
  data?: Object | Function
  methods?: {
    // TODO: 推断 this 的属性
    [key: string]: (this: any, ...args: any[]) => any
  }
  [key: string]: any
}

class Vue<T extends VueOptions = VueOptions> {
  _data: Object = {}
  protected $options: T

  constructor($options: T) {
    this.$options = $options || {}
    this.initData()
  }

  /** 数据初始化 */
  initData() {
    let data = this.$options.data
    // 将 data 存放到 _data 中
    data = this._data = typeof data === 'function' ? data.call(this) : data

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
