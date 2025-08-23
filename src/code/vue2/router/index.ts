import Home from '@/views/Home'
import type { Routes } from '../types/router'
import Component from '@/views/Component'
import Data from '@/views/Data'
import HashRouter from './hashRouter'
import C11 from '@/views/Route/C11'
import Route from '@/views/Route'
import C1 from '@/views/Component/C1'
import C2 from '@/views/Route/C2'

const routes: Routes = [
  {
    path: '/',
    component: Home,
    name: 'home',
  },
  {
    path: '/route',
    component: Route,
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
]

const router = new HashRouter(routes)

export default router
