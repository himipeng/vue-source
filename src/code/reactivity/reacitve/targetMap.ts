import { Dep } from '../dep'
import { ReactiveEffect } from '../effect/ReactiveEffect'

type Key = string | symbol
type TargetMap = WeakMap<object, Map<Key, Dep>> // 所有响应式对象及其属性的依赖记录

// 全局依赖图：targetMap 记录所有响应式对象中，每个属性对应的 effect 集合
const targetMap: TargetMap = new WeakMap()

/**
 * track 收集依赖
 * 每当读取响应式对象的某个属性时，触发依赖收集，把当前正在运行的 effect 与这个属性建立联系
 */
export function track(target: object, key: Key) {
  const effect = ReactiveEffect.activeEffect
  if (!effect) return // 当前没有正在运行的副作用函数，直接跳过

  // 获取 target 对应的所有属性依赖映射
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 获取指定 key 对应的依赖集合（一个 Dep，其实是 Set<ReactiveEffect>）
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }

  // 建立依赖关系：effect 被添加到这个 key 的 dep 中
  if (!dep.subs.has(effect)) {
    dep.subs.add(effect) // key → effect
  }
  if (!effect.deps.includes(dep)) {
    effect.deps.push(dep) // effect → dep（双向追踪，方便后续清理）
  }
}

/**
 * trigger 派发通知
 * 当修改响应式对象的某个属性时，找到所有依赖这个属性的 effect，并触发它们重新运行
 */
export function trigger(target: object, key: Key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return // 没有依赖记录，说明没人在监听这个属性，直接返回

  const dep = depsMap.get(key)
  if (!dep) return // 没有依赖这个属性的 effect，直接返回

  const effectsToRun = new Set<ReactiveEffect>()

  dep.subs.forEach((effect) => {
    if (effect !== ReactiveEffect.activeEffect) {
      effectsToRun.add(effect) // 收集所有需要重新运行的 effect
    }
  })

  // 执行收集到的 effect
  effectsToRun.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler() // 如果有调度器（如用于批处理更新），使用调度器
    } else {
      effect.run() // 否则直接运行副作用函数
    }
  })
}
