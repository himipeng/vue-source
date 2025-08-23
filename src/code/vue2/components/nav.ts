import type HashRouter from "@vue/vue2/router/hashRouter"

const style = `
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 20px;
  flex-wrap: wrap;
`

interface Tag {
  dom: HTMLAnchorElement
  path: string
}

class Nav {
  private router: HashRouter
  private tags: Tag[] = []

  constructor(router: HashRouter) {
    this.router = router
    // 渲染导航
    const routes = this.router.routes
    routes
      .filter((route) => route.name)
      .forEach((route) => {
        const tag = document.createElement('a')
        tag.innerText = route.name!
        tag.style.cursor = 'pointer'

        tag.addEventListener('click', (e) => {
          e.preventDefault()
          this.router.push(route.path)
          this.render()
        })

        this.tags.push({ dom: tag, path: route.path })
      })
  }

  private render() {
    this.tags.forEach((tag) => {
      const current = this.router.currentPath
      if (tag.path === '/') {
        tag.dom.style.color = current === tag.path ? 'red' : 'blue'
      } else {
        tag.dom.style.color = current.startsWith(tag.path) ? 'red' : 'blue'
      }
    })
  }

  public mount(root: HTMLDivElement) {
    root.setAttribute('style', style)

    this.tags.forEach((tag) => {
      root.appendChild(tag.dom)
    })

    this.render()
  }
}

export default Nav
