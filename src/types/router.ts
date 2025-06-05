import type { ComponentOptions } from '../code/Component/defineComponent'

export interface Route {
  path: string
  component: ComponentOptions
  name?: string
  children?: Route[]
}

export type Routes = Route[]
