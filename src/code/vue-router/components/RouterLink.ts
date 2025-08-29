import { defineComponent, h, inject } from 'vue'
import type { Router } from '../router'
import { routerKey } from '../injectionSymbols'
import type { RouteLocationRaw } from '../types'

interface Props {
  /** 目标路径 */
  to: RouteLocationRaw
  /** 是否 replace */
  replace: boolean
}

export const RouterLink = defineComponent<Props>({
  name: 'RouterLink',
  setup(props) {
    const router = inject<Router>(routerKey)!
    const to = router.resolve(props.to)

    const navigate = (e: MouseEvent) => {
      e.preventDefault()
      if (props.replace) {
        router.replace(to)
      } else {
        router.push(to)
      }
    }

    return () => {
      const children = to.name ?? to.path
      return h(
        'a',
        {
          href: typeof props.to === 'string' ? props.to : router.resolve(props.to).fullPath,
          onClick: navigate,
        },
        children
      )
    }
  },
})
