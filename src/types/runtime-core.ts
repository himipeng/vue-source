export interface VNode {
  __v_isVNode: true
  type: string | Function
  props: Record<string, any> | null
  children: string | VNode[] | null
  el: HTMLElement | Text | null
  key?: string | number | null
}

type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren

export type RenderFunction = (_ctx?: object, _cache?: any) => VNodeChild
