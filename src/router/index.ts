import { createRouter, createWebHistory, type RouteRecord } from 'vue-router'
import Home from '@/views/Home'
import Router from '@/views/Router'
import R1 from '@/views/Router/R1'
import R2 from '@/views/Router/R2'
import R3 from '@/views/Router/R3'
import R4 from '@/views/Router/R4'
import Ref from '@/views/Ref'
import Reactive from '@/views/Reactive'

export const routes: RouteRecord[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/router',
    name: 'router',
    component: Router,
    children: [
      {
        path: 'r1',
        name: 'r1',
        component: R1,
        children: [
          { path: 'r3', name: 'r3', component: R3 },
          { path: 'r4', name: 'r4', component: R4 },
        ],
      },
      {
        path: 'r2',
        name: 'r2',
        component: R2,
      },
    ],
  },
  {
    path: '/ref',
    name: 'ref',
    component: Ref,
  },
  {
    path: '/reactive',
    name: 'reactive',
    component: Reactive,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
