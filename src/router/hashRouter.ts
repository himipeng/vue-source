import type { Routes } from '../types/router'

class HashRouter {
  routes: Routes
  root?: HTMLDivElement

  /** 当前路径 */
  get currentPath() {
    return location.hash.slice(1) || '/'
  }

  get currentName() {
    return this.routes.find((route) => route.path === this.currentPath)?.name || ''
  }

  constructor(routes: Routes) {
    this.routes = routes
  }

  private render(root: HTMLDivElement) {
    if (!root) return

    const component = this.routes.find((route) => route.path === this.currentPath)?.component
    if (!component) return

    component(this.root)
  }

  public push(path: string) {
    location.hash = path
    this.root && this.render(this.root)
  }

  public replace(path: string) {
    location.hash = path
    this.root && this.render(this.root)
  }

  public mount(root: HTMLDivElement) {
    this.root = root

    window.addEventListener('hashchange', () => {
      this.render(root)
    })

    this.render(root)
  }

  public go(n: number) {
    history.go(n)
  }
}

export default HashRouter
