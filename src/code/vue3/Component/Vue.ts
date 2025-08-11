import { isRef } from '../utils'

export interface VueOptions {
  setup?: () => Record<string, any>
}

class Vue<T extends VueOptions = VueOptions> {
  _data: Object = {}
  _setupState: Record<string, any> = {}
  protected $options: T

  constructor($options: T) {
    this.$options = $options || {}
    this.initSetup()
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
