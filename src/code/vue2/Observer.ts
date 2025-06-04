import Dep from './Dep'

class Observer {
  value

  constructor(value) {
    this.value = value
    def(value, '__ob__', this) // 标记为已经观察过

    if (Array.isArray(value)) {
      // 重写数组方法
      value.__proto__ = arrayMethods
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  walk(obj) {
    Object.keys(obj).forEach((key) => this.defineReactive(obj, key, obj[key]))
  }

  observeArray(items) {
    items.forEach((item) => observe(item))
  }

  private defineReactive(obj, key, val) {
    const dep = new Dep() // 每个属性一个 Dep

    const childOb = observe(val) // 深度递归劫持

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        if (Dep.target) {
          dep.depend() // 收集依赖
          if (childOb) childOb.dep.depend() // 嵌套对象也收集
        }
        return val
      },
      set(newVal) {
        if (newVal !== val) {
          val = newVal
          observe(newVal) // 新值也要被观察
          dep.notify() // 通知依赖更新
        }
      },
    })
  }
}

export default Observer
