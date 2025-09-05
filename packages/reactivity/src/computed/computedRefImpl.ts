import { Dep } from '../dep'
import { ReactiveEffect } from '../effect'

export type ComputedGetter<T> = (oldValue?: T) => T
export type ComputedSetter<T> = (newValue: T) => void

export interface ComputedOptions<T, S = T> {
  get: ComputedGetter<T>
  set?: ComputedSetter<S>
}

// TODO: 源码Vue 3.5+ 的 ComputedRefImpl 实际上本身是 Subscriber
// 旧版 的 ComputedRefImpl 是一个特殊的 RefImpl
export class ComputedRefImpl<T = any> {
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

  constructor(public getter: ComputedGetter<T>, private readonly setter: ComputedSetter<T> | undefined) {
    this.effect = new ReactiveEffect(() => {
      // 当依赖改变时，触发
      if (!this._dirty) {
        // 标记为脏数据（需要重新计算）
        this._dirty = true
        // TODO: 只标记，不触发，保持懒特性
        this.dep.trigger()
      }
      return getter()
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
