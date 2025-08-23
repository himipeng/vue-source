import type { ComponentOptions } from '../../../types/component'

export interface Route {
  path: string
  component: ComponentOptions
  name?: string
  children?: Route[]
}

export type Routes = Route[]
