import { ReactiveEffect } from '../effect/ReactiveEffect'
import { type RefImpl } from '../ref/RefImpl'
import { hasChanged, isFunction, isReactive, isRef } from '../utils'
import { traverse } from './traverse'

export type Getter = () => any
export type Source = RefImpl<any> | Array<any> | Getter | object
export type Cb = (newVal: any, oldVal: any) => void
export interface WatchOptions {
  deep?: boolean
  immediate?: boolean
}

function doWatch(source: any, cb?: Function | null, options: WatchOptions = {}) {
  let { deep = false, immediate = false } = options

  let getter: () => any

  // 解析 source
  if (isRef(source)) {
    // 如果是 ref，直接返回其值
    getter = () => source.value
  } else if (isReactive(source)) {
    // 如果是 reactive，对象进行深度递归
    getter = () => source
    // 强制深度监视
    deep = true
  }
  // 多个源：逐一解析
  else if (Array.isArray(source)) {
    getter = () => source.map((s) => (isRef(s) ? s.value : isReactive(s) ? traverse(s) : s))
  } else if (isFunction(source)) {
    // 如果是 getter 函数，直接使用
    getter = source
  } else {
    // NOPE
    getter = () => {}
  }

  // 处理深度监视
  if (deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  const INITIAL_WATCHER_VALUE = Symbol('INITIAL_WATCHER_VALUE')
  let oldValue = INITIAL_WATCHER_VALUE
  // 执行回调函数
  const job = () => {
    if (cb) {
      const newValue = getter()
      if (deep || hasChanged(newValue, oldValue)) {
        if (immediate || oldValue !== INITIAL_WATCHER_VALUE) {
          cb(newValue, oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue)
        }
        oldValue = newValue
      }
    } else {
      getter() // 仅执行副作用，无回调
    }
  }

  // 创建 ReactiveEffect
  const effect = new ReactiveEffect(job)
  effect.run()

  return () => {
    effect.stop()
  }
}

export default doWatch
