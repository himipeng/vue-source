import type { Routes } from '../types/router'
import HashRouter from './hashRouter'
import Home from '../views/Home/index.ts'
import About from '../views/Route/index.ts'
import C1 from '../views/Route/C1.ts'
import C2 from '../views/Route/C2.ts'
import C11 from '../views/Route/C11.ts'
import Component from '../views/Component/index.ts'
import Data from '../views/Data/index.ts'
import Ref from '../views/Ref/index.ts'

const routes: Routes = [
  {
    path: '/',
    component: Home,
    name: 'home',
  },
  {
    path: '/route',
    component: About,
    name: 'route',
    children: [
      {
        path: '/route/c1',
        name: 'c1',
        component: C1,
        children: [
          {
            path: '/route/c1/c11',
            name: 'c11',
            component: C11,
          },
        ],
      },
      {
        path: '/route/c2',
        name: 'c2',
        component: C2,
      },
    ],
  },
  {
    path: '/component',
    name: 'component',
    component: Component,
  },
  {
    path: '/data',
    name: 'data',
    component: Data,
  },
  {
    path: '/ref',
    name: 'ref',
    component: Ref,
  },
]

const router = new HashRouter(routes)

export default router
