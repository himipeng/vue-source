import type { ComponentOptions } from './component'

export interface Route {
  path: string
  component: ComponentOptions
  name?: string
  children?: Route[]
}

export type Routes = Route[]
