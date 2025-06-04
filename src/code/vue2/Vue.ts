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
    this._initMethods()
  }

  /** 数据初始化 */
  initData() {
    let data = this.$options.data
    // 将 data 存放到 _data 中
    data = this._data = typeof data === 'function' ? data.call(this) : data

    // 将 data 中的属性代理到 vm 实例上
    for (let key in data) {
      this.proxy(this, `_data`, key)
    }

    // 数据劫持核心：观察 data
    // this.observe(data)
  }

  /** 初始化方法 */
  private _initMethods() {
    const methods = this.$options.methods || {}
    for (const key in methods) {
      const method = methods[key]
      // 绑定 this 到当前 Vue 实例
      this[key] = method.bind(this)
    }
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
  private observe(value) {
    if (typeof value !== 'object' || value === null) return
    let ob
    if (value.__ob__ !== undefined) {
      ob = value.__ob__
    } else {
      ob = new Observer(value)
    }
    return ob
  }
}

export default Vue
