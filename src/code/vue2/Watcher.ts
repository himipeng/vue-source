import { Dep } from './Dep'

export default class Watcher {
  private getter: Function

  constructor(getter: Function) {
    this.getter = getter
    this.get()
  }

  private get() {
    // 设置当前活跃 watcher
    const prevActiveWatcher = Dep.activeWatcher
    Dep.activeWatcher = this
    try {
      this.getter() // 执行 getter，会触发依赖收集
    } finally {
      // 恢复之前的活跃 watcher
      Dep.activeWatcher = prevActiveWatcher
    }
  }

  update() {
    this.get()
  }
}
