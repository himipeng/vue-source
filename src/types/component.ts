import type { RenderFunction } from './runtime-core'

export interface ComponentOptions extends LicyCycleHooks {
  $type?: 'vue2' | 'vue3'
  name?: string
  template?: string
  components?: Record<string, ComponentOptions>
  data?: (() => Record<string, any>) | Record<string, any>
  methods?: Record<string, (this: any) => void>
  setup?: () => Record<string, any>
  computed?: Record<string, Function>
  watch?: Record<string, Function>
  render?: RenderFunction
  props?: Record<string, any>
  directives?: Record<string, Function>
  filters?: Record<string, Function>
  provide?: () => Record<string, any>
  inject?: string[]
}

interface LicyCycleHooks {
  beforeCreate?: () => void
  created?: () => void
  beforeMount?: () => void
  mounted?: () => void
  beforeUpdate?: () => void
  updated?: () => void
  beforeDestroy?: () => void
  destroyed?: () => void
}
