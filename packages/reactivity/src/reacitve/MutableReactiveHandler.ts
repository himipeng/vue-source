import { hasOwn, isArray, isIntegerKey, isSymbol } from '@pure-vue/shared'
import { reactive } from '.'
import { hasChanged, isObject, isRef, toRaw } from '../utils'
import { ReactiveFlags } from './ReactiveFlags'
import { arrayInstrumentations } from './arrayInstrumentations'
import { track, trigger, TriggerOpTypes } from './targetMap'
import { ITERATE_KEY } from '../dep'

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

/**x
 * MutableReactiveHandler 是 Vue 3 响应式系统中用于创建响应式对象的 Proxy handler。
 * 它拦截对目标对象的读取、设置、删除等操作，实现依赖收集和触发更新的功能。
 * 该类支持深度响应式处理，并针对数组方法做了特殊处理以优化性能和行为一致性。
 */
export class MutableReactiveHandler implements ProxyHandler<Target> {
  constructor(protected readonly _isReadonly = false, protected readonly _isShallow = false) {}

  /**
   * 拦截读取操作，返回对应的属性值。
   * 该方法会进行依赖收集，并递归地将嵌套对象转为响应式对象。
   * 对数组的特定方法做了重写以支持依赖追踪和触发。
   * @param target 目标对象
   * @param key 被读取的属性键
   * @param receiver Proxy 或继承对象
   * @returns 属性对应的值，可能是响应式对象或原始值
   */
  get(target: Target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    } else if (key === ReactiveFlags.RAW) {
      return target
    }

    // Array 方法改写
    // 1.只读方法的修复: include 等方法的依赖收集
    // 2.修改方法的优化: push、pop 等方法的依赖触发（暂停依赖收集）
    if (isArray(target) && arrayInstrumentations[key]) {
      return arrayInstrumentations[key]
    }

    const res = Reflect.get(target, key, isRef(target) ? target : receiver)

    track(target, key)

    // 递归响应式处理
    if (isObject(res)) {
      return reactive(res)
    }

    return res
  }

  /**
   * 拦截设置操作，设置属性值并触发相关依赖更新。
   * 支持处理 ref 类型的特殊赋值逻辑，以及数组的新增或修改操作。
   * @param target 目标对象
   * @param key 被设置的属性键
   * @param value 新的属性值
   * @param receiver Proxy 或继承对象
   * @returns 设置操作是否成功
   */
  set(target: Record<string | symbol, unknown>, key: string | symbol, value: unknown, receiver: object): boolean {
    let oldValue = target[key]

    oldValue = toRaw(oldValue)
    value = toRaw(value)

    // 如果旧值是 ref，新值不是 ref → 自动更新 .value
    if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    }

    // 处理新增的情况，如 obj.a = 'xx'， arr.push('xx')
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)

    // 通过 Reflect.set 进行真实赋值
    const result = Reflect.set(target, key, value, isRef(target) ? target : receiver)

    // 只有 目标对象确实是 receiver 本身 时才触发依赖，防止其子类实例的改变触发父类
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key)
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key)
      }
    }

    return result
  }

  /**
   * 拦截删除操作，删除目标对象的指定属性，并触发依赖更新。
   * @param target 目标对象
   * @param key 要删除的属性键
   * @returns 删除操作是否成功
   */
  deleteProperty(target: Record<string | symbol, unknown>, key: string | symbol): boolean {
    const hadKey = hasOwn(target, key)
    // const oldValue = target[key]
    const result = Reflect.deleteProperty(target, key)
    if (result && hadKey) {
      trigger(target, TriggerOpTypes.DELETE, key)
    }
    return result
  }

  /**
   * 拦截 in 操作符，判断属性是否存在于目标对象中。
   * 同时进行依赖收集，避免遗漏对属性存在性的响应式追踪。
   * @param target 目标对象
   * @param key 要检测的属性键
   * @returns 属性是否存在于目标对象中
   */
  has(target: Record<string | symbol, unknown>, key: string | symbol): boolean {
    const result = Reflect.has(target, key)
    if (!isSymbol(key)) {
      track(target, key)
    }
    return result
  }

  /**
   * 拦截 Object.getOwnPropertyKeys 等操作，返回目标对象自身的所有属性键。
   * 同时进行依赖收集，用于追踪对象的遍历操作。
   * @param target 目标对象
   * @returns 目标对象的所有自身属性键组成的数组
   */
  ownKeys(target: Record<string | symbol, unknown>): (string | symbol)[] {
    track(target, isArray(target) ? 'length' : ITERATE_KEY)
    return Reflect.ownKeys(target)
  }
}
