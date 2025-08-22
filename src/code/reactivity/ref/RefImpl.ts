import { createDep, type Dep } from '../dep'
import { reactive } from '../reacitve'
import { ReactiveEffect } from '../effect/ReactiveEffect'
import { hasChanged, isObject, toRaw } from '../utils'

// 观察者模式中的Subject
export class RefImpl<T> {
  /** 原始值 */
  private _rawValue: T
  /** value值 */
  private _value: T
  /** ref标识 */
  public readonly __v_isRef = true
  /** 中介容器，把 Subject 和多个 Observer 关联起来 */
  public dep: Dep = createDep()

  constructor(value: T) {
    // 保存原始值到_rawValue
    this._rawValue = toRaw(value)
    // 如果是对象（引用类型），使用reactive将对象转为响应式的（Proxy），因此将一个对象传入ref，实际上也是调用了reactive
    this._value = toReactive(value)
  }

  get value() {
    // 收集依赖
    trackRefValue(this)
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
      triggerRefValue(this)
    }
  }
}

function toReactive(value: any) {
  return isObject(value) ? reactive(value) : value
}

export function trackRefValue(target: RefImpl<any>) {
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

export function triggerRefValue(target: RefImpl<any>) {
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
