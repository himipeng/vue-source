import { createDep } from '../dep'
import { ReactiveEffect } from '../effect'

export interface ComputedConfig<T> {
  get: () => T
  set?: (val: T) => void
}

export default class ComputedRefImpl<T> {
  /**  value 值 */
  private _value: T
  /**  数据是否为脏数据（失效） */
  private _dirty: boolean = true
  /**  本身作为依赖时，收集副作用 */
  public dep = createDep()
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
        // 同时作为依赖，通知副作用
        trigger(this)
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
    track(this)
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

export function track(target: ComputedRefImpl<any>) {
  if (!ReactiveEffect.activeEffect) {
    return
  }
  const dep = target.dep
  // console.log('trackRefValue', dep.size, dep)
  // 收集依赖
  dep.add(ReactiveEffect.activeEffect)
  // 双向追踪，反向记录
  if (!ReactiveEffect.activeEffect?.deps.includes(dep)) {
    ReactiveEffect.activeEffect.deps.push(dep)
  }
}

export function trigger(target: ComputedRefImpl<any>) {
  const dep = target.dep
  if (dep.size === 0) {
    return
  }

  // console.log('triggerRefValue', dep.size, dep)

  // 创建一个新的 Set 防止重复执行(快照)
  const effectsToRun = new Set<ReactiveEffect>()

  // 收集要运行的 effect（避免自身触发自身）
  dep.forEach((effect) => {
    if (effect !== ReactiveEffect.activeEffect) {
      effectsToRun.add(effect)
    }
  })

  // 执行 effect，支持 scheduler
  // TODO: 这里可以优化为异步执行
  effectsToRun.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  })
}
