export interface Route {
  path: string
  component: Function
  name?: string
}

export type Routes = Route[]
