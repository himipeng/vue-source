import { isArray, isIntegerKey } from '@purevue/shared'
import { ARRAY_ITERATE_KEY, Dep, ITERATE_KEY } from '../dep'
import { activeEffect, shouldTrack } from '../effect'

type Key = string | symbol

/**
 * TargetMap 类型定义
 * 使用 WeakMap 存储响应式对象（target）与其属性依赖映射（Map<Key, Dep>）的关系
 * 这样可以自动回收无用的响应式对象，避免内存泄漏
 */
export type TargetMap = WeakMap<object, Map<Key, Dep>> // 所有响应式对象及其属性的依赖记录

// 全局依赖图：targetMap 记录所有响应式对象 reactive 中，每个属性对应的 effect 集合
const targetMap: TargetMap = new WeakMap()

/**
 * track 收集依赖
 * 每当读取响应式对象的某个属性时，触发依赖收集，把当前正在运行的 effect 与这个属性建立联系
 * @param target 响应式对象
 * @param key 被访问的属性键
 */
export function track(target: object, key: Key) {
  // 如果当前没有正在运行的副作用函数，或者不应该收集依赖，直接跳过
  if (!activeEffect || !shouldTrack) return

  // 获取 target 对应的所有属性依赖映射
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 如果不存在则新建一个 Map 来存储该 target 的属性依赖
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 获取指定 key 对应的依赖集合（一个 Dep，其实是 Set<ReactiveEffect>）
  let dep = depsMap.get(key)
  if (!dep) {
    // 如果不存在则新建一个 Dep 用于收集依赖
    dep = new Dep()
    depsMap.set(key, dep)
  }

  // 将当前 activeEffect 添加到 dep 中，实现依赖收集
  dep.track()
}

/**
 * 触发类型枚举，表示对响应式对象属性的操作类型
 */
export enum TriggerOpTypes {
  SET = 'set', // 修改已有属性
  ADD = 'add', // 新增属性
  DELETE = 'delete', // 删除属性
  CLEAR = 'clear', // 清空集合
}

/**
 * trigger 派发通知
 * 当修改响应式对象的某个属性时，找到所有依赖这个属性的 effect，并触发它们重新运行
 * @param target 响应式对象
 * @param type 操作类型，参考 TriggerOpTypes
 * @param key 被操作的属性键
 */
export function trigger(target: object, type: TriggerOpTypes, key: Key) {
  // 获取 target 对应的所有属性依赖映射
  const depsMap = targetMap.get(target)
  if (!depsMap) return // 没有依赖记录，说明没人在监听这个属性，直接返回

  // 如 Map.clear()
  if (type === TriggerOpTypes.CLEAR) {
    // 如果是清空操作，触发所有依赖
    depsMap.forEach((dep) => {
      dep.trigger()
    })
  } else {
    // 判断 target 是否为数组
    const targetIsArray = isArray(target)
    // 判断 key 是否为数组索引（整数键）
    const isArrayIndex = targetIsArray && isIntegerKey(key)

    if (targetIsArray && key === 'length') {
      // TODO
      // 如果修改的是数组的 length 属性
      // 这里的逻辑暂时注释，实际应触发长度相关依赖
      // const newLength = Number(newValue)
      // depsMap.forEach((dep, key) => {
      //   if (key === 'length' || key === ARRAY_ITERATE_KEY || (!isSymbol(key) && key >= newLength)) {
      //     run(dep)
      //   }
      // })
      return
    }

    // 触发指定 key 的依赖
    const dep = depsMap.get(key)
    if (dep) dep.trigger()

    // 如果是数组索引，触发数组迭代器相关依赖
    if (isArrayIndex) {
      depsMap.get(ARRAY_ITERATE_KEY)?.trigger()
    }

    // 根据不同操作类型，触发额外的依赖
    switch (type) {
      case TriggerOpTypes.ADD:
        if (!targetIsArray) {
          // 新增普通对象属性，触发对象的迭代器依赖
          depsMap.get(ITERATE_KEY)?.trigger()
        } else if (isArrayIndex) {
          // 新增数组索引，触发 length 属性的通知，如 Array.push()
          depsMap.get('length')?.notify()
        }
        break
      case TriggerOpTypes.DELETE:
        if (!targetIsArray) {
          // 删除普通对象属性，触发对象的迭代器依赖
          depsMap.get(ITERATE_KEY)?.trigger()
        }
        break
      case TriggerOpTypes.SET:
        // 修改已有属性，之前已经触发过对应 key 的依赖，无需额外操作
        break
    }
  }
}
