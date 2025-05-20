import type { Routes } from '../types/router'

class Nav {
  routes: Routes

  constructor(routes: Routes) {
    this.routes = routes
  }
}

export default Nav
