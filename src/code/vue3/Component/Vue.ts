import { isRef } from '../utils'
import Observer from '../../vue2/Observer'

export interface VueOptions {
  data?: Object | Function
  methods?: {
    // TODO: 推断 this 的属性
    [key: string]: (this: any, ...args: any[]) => any
  }
  setup?: () => Record<string, any>
}

class Vue<T extends VueOptions = VueOptions> {
  _data: Object = {}
  _setupState: Record<string, any> = {}
  protected $options: T

  constructor($options: T) {
    this.$options = $options || {}
    this.initSetup()
    this.initData()
    // 不再返回组件实例，而是返回组件实例的代理对象
    return this.initProxy()
  }

  /** 初始化 setup 并保存到 _setupState */
  initSetup() {
    const { setup } = this.$options
    if (!setup) return

    const rawResult = setup()
    this._setupState = this.proxyRefs(rawResult)
  }

  /** 自动代理 ref: .value → value */
  proxyRefs(obj: Record<string, any>) {
    const res: Record<string, any> = {}
    for (const key in obj) {
      const val = obj[key]
      Object.defineProperty(res, key, {
        enumerable: true,
        configurable: true,
        get() {
          return isRef(val) ? val.value : val
        },
        set(newVal) {
          if (isRef(val)) {
            val.value = newVal
          } else {
            obj[key] = newVal
          }
        },
      })
    }
    return res
  }

  /** 数据初始化 */
  initData() {
    let data = this.$options.data
    // 将 data 存放到 _data 中
    data = this._data = typeof data === 'function' ? data.call(this) : data || {}

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

  /** 构造一个代理，实现 this.xxx 优先访问 setup → data */
  initProxy() {
    return new Proxy(this, {
      get(target, key: string) {
        if (key in target._setupState) {
          return target._setupState[key]
        } else if (key in target._data) {
          return target._data[key]
        } else {
          return target[key]
        }
      },
      set(target, key: string, value: any) {
        if (key in target._setupState) {
          target._setupState[key] = value
        } else if (key in target._data) {
          target._data[key] = value
        } else {
          target[key] = value
        }
        return true
      },
    })
  }
}

export default Vue
