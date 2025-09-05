import { toReactive } from '../reacitve'
import { hasChanged, toRaw } from '../utils'
import { Dep } from '../dep'

// 观察者模式中的Subject
export class RefImpl<T> {
  /** 原始值 */
  private _rawValue: T
  /** value值 */
  private _value: T
  /** ref标识 */
  public readonly __v_isRef = true
  /** 中介容器，把 Subject 和多个 Observer 关联起来 */
  public dep = new Dep()

  constructor(value?: T) {
    // 保存原始值到_rawValue
    this._rawValue = toRaw(value)
    // 如果是对象（引用类型），使用reactive将对象转为响应式的（Proxy），因此将一个对象传入ref，实际上也是调用了reactive
    this._value = toReactive(value)
  }

  get value() {
    // 收集依赖
    this.dep.track()
    return this._value
  }

  set value(newValue: T) {
    const oldValue = this._rawValue
    newValue = toRaw(newValue)

    // 如果值改变，才会触发依赖
    if (hasChanged(newValue, oldValue)) {
      // 更新值
      this._rawValue = newValue
      // 判断是否是对象，进行赋值
      this._value = toReactive(newValue)
      // 派发通知
      this.dep.trigger()
    }
  }
}
