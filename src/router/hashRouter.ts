import type { Route, Routes } from '../types/router'

interface RouteLink {
  route: Route
  child?: RouteLink
}

class HashRouter {
  routes: Routes
  root?: Element

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

  private capture(path: string, routes: Routes): RouteLink | null {
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]
      if (route.path === path) {
        return { route }
      }

      if (route.children) {
        const childLink = this.capture(path, route.children)
        if (childLink) {
          return { route, child: childLink }
        }
      }
    }
    return null
  }

  private renderLink(link: RouteLink, root: Element) {
    const { route, child } = link
    const view = root.querySelector('router-view')
    if (!view) return
    const { component } = route
    if (!component) return
    component.render(view)

    if (child) {
      this.renderLink(child, view)
    }
  }

  private render(root: Element) {
    if (!root) return

    // 捕获路由链表
    const link = this.capture(this.currentPath, this.routes)
    console.log(link)
    if (!link) {
      console.error(`No route found for path: ${this.currentPath}`)
      return
    }

    this.renderLink(link, root)
  }

  public push(path: string) {
    location.hash = path
    this.root && this.render(this.root)
  }

  public replace(path: string) {
    location.hash = path
    this.root && this.render(this.root)
  }

  public mount(root: Element) {
    this.root = root

    window.addEventListener('hashchange', (e) => {
      this.render(root)
    })

    this.render(root)
  }

  public go(n: number) {
    history.go(n)
  }
}

export default HashRouter
