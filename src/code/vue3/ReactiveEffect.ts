// ReactiveEffect 是 Vue 3 响应式系统中的 核心类，它表示一个“副作用函数”（effect），即在数据变化时需要重新执行的逻辑。
// 可以把它看作是 Vue 2 中 Watcher 的替代品，但更轻量、更灵活、且支持嵌套、调度器等高级功能。

import type { Dep } from './Dep'

// 观察者模式中的 Observer 类
export default class ReactiveEffect {
  /** 是否仍处于活跃状态，控制 effect 是否还能收集依赖 */
  public active = true
  /** 记录当前这个 effect 被哪些响应式属性的 dep（依赖集合）引用了，用于在 stop() 或更新时清理依赖关系 */
  // 双向追踪，反向记录
  /* 
  Vue 3 的响应式系统中：
	•	dep (Set<effect>)：被观察对象记录所有观察者（你说的对✅）
	•	effect.deps (Dep[])：观察者反过来记录自己在哪些对象中被追踪（用于清理）
  二者配合，构成了可追踪 + 可解绑的响应系统，比 Vue 2 更高效可靠。
  */
  public deps: Dep[] = []
  /** 外层effect，用于处理嵌套effect */
  public parent: ReactiveEffect | null = null

  constructor(
    public fn: () => void,
    /** effect 的“更新调度器”。如果有，它接管 effect 的执行逻辑；如果没有，effect 默认立即运行。 */
    public scheduler?: () => void
  ) {}

  // 每次执行 effect.run()，都会重新收集它的依赖，而旧的依赖会在执行前被清除
  run() {
    if (!this.active) {
      // 如果 effect 已经被 stop 掉，直接执行一次 fn，不参与响应式追踪
      return this.fn()
    } else {
      // 依赖切换前先清理旧的依赖
      /* 例子
      const effect = new ReactiveEffect(() => {
        console.log(flag.value ? count.value : 'no count')
      })
      */
      cleanupEffect(this)

      // 依赖收集
      this.parent = ReactiveEffect.activeEffect
      ReactiveEffect.activeEffect = this

      try {
        return this.fn()
      } finally {
        // 清除依赖
        ReactiveEffect.activeEffect = this.parent
        this.parent = null
      }
    }
  }
  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }

  static activeEffect: ReactiveEffect | null = null
}

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }
  effect.deps.length = 0
}
