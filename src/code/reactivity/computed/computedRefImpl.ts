import { Dep } from '../dep'
import { ReactiveEffect } from '../effect'

export interface ComputedConfig<T> {
  get: () => T
  set?: (val: T) => void
}

// TODO: 源码的 ComputedRefImpl 实际上本身是 Subscriber
export default class ComputedRefImpl<T = any> {
  /**  value 值 */
  private _value: T
  /**  数据是否为脏数据（失效） */
  private _dirty: boolean = true
  /**  本身作为依赖时，收集副作用 */
  public dep = new Dep()
  /**  本身作为副作用时，被依赖收集 */
  private effect: ReactiveEffect
  /** ref标识 */
  public readonly __v_isRef = true
  /**  setter */
  private setter?: (val: T) => void

  constructor(config: ComputedConfig<T>) {
    const { get, set } = config
    this.setter = set

    this.effect = new ReactiveEffect(() => {
      // 当依赖改变时，触发
      if (!this._dirty) {
        // 标记为脏数据（需要重新计算）
        this._dirty = true
        // TODO: 只标记，不触发，保持懒特性
        this.dep.trigger()
      }
      return get()
    })
    // 启动该副作用
    this._value = this.effect.run()
  }

  get value() {
    if (this._dirty) {
      this._value = this.effect.run() // 重新计算
      this._dirty = false // 重置脏标记
    }
    this.dep.track()
    return this._value // 返回缓存的值
  }

  set value(newValue: T) {
    if (this.setter) {
      this.setter(newValue)
    } else {
      console.warn('Write operation failed: computed value is readonly')
    }
  }
}
