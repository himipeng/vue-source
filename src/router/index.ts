import type { Routes } from '../types/router'
import About from '../views/About.ts'
import Home from '../views/Home.ts'
import HashRouter from './hashRouter'

const routes: Routes = [
  {
    path: '/',
    component: Home,
    name: 'home',
  },
  {
    path: '/about',
    component: About,
    name: 'about',
  },
]

const router = new HashRouter(routes)

export default router
