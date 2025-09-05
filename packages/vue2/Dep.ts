import type Watcher from './Watcher'

export class Dep {
  subs: Watcher[] = []

  depend() {
    if (Dep.activeWatcher && !this.subs.includes(Dep.activeWatcher)) {
      this.subs.push(Dep.activeWatcher)
    }
  }

  notify() {
    this.subs.forEach((watcher) => watcher.update())
  }

  static activeWatcher: Watcher | null = null
}
