import type { Component } from '../code/defineComponent'

export interface Route {
  path: string
  component: Component
  name?: string
  children?: Route[]
}

export type Routes = Route[]
