// 将一个普通对象转换为响应式对象
export default class Observer {
  constructor(data: any) {
    this.walk(data)

    // 将 Observer 实例挂载到数据对象上，给对象打上响应式的“标记”
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false,
    })
  }

  /** 遍历对象所有属性，进行响应式处理 */
  private walk(obj: object) {
    Object.keys(obj).forEach((key) => {
      this.defineReactive(obj, key, obj[key])
    })
  }

  /** 定义响应式属性 */
  private defineReactive(obj: any, key: string, val: any) {
    const self = this
    // 递归处理嵌套对象
    this.observe(val)

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 你可以在这里添加依赖收集（Dep）
        return val
      },
      set(newVal) {
        if (newVal === val) return
        val = newVal
        // 你可以在这里触发更新视图
        console.log(`[Reactive] ${key} updated to`, newVal)
        // 如果新值是对象，也需要观察
        // 此时 this 指向 obj
        self.observe(newVal) // 新值也可能是对象，需要递归
      },
    })
  }

  /** 观察子对象 */
  private observe(value: any) {
    if (typeof value === 'object' && value !== null) {
      new Observer(value)
    }
  }
}
