import type { Routes } from '../types/router'
import HashRouter from './hashRouter'

const routes: Routes = [
  {
    path: '/',
    component: () => import('../views/Home.ts'),
    name: 'Home',
  },
]

const router = new HashRouter(routes)

export default router
