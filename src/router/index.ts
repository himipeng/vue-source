import type { Routes } from '../types/router'
import HashRouter from './hashRouter'
import Home from '../views/Home/index.ts'
import About from '../views/About/index.ts'
import C1 from '../views/About/C1.ts'
import C2 from '../views/About/C2.ts'
import C11 from '../views/About/C11.ts'

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
    children: [
      {
        path: '/about/c1',
        name: 'c1',
        component: C1,
        children: [
          {
            path: '/about/c1/c11',
            name: 'c11',
            component: C11,
          },
        ],
      },
      {
        path: '/about/c2',
        name: 'c2',
        component: C2,
      },
    ],
  },
]

const router = new HashRouter(routes)

export default router
