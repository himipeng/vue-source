import type { Routes } from '../types/router'

class HashRouter {
  routes: Routes
  root?: HTMLDivElement

  constructor(routes: Routes) {
    console.log(routes)
    this.routes = routes
  }

  public mount(root: HTMLDivElement) {
    this.root = root
    window.addEventListener('hashchange', (v) => {
      console.log(v)
    })
  }
}

export default HashRouter
