import { computed, defineComponent, h, inject } from 'pvue'
import type { Router } from '../router'
import { routeLocationKey, routerKey } from '../injectionSymbols'
import type { RouteLocationRaw } from '../types'

interface Props {
  /** 目标路径 */
  to: RouteLocationRaw
  /** 是否 replace */
  replace: boolean
}

/**
 * RouterLink 组件
 */
export const RouterLink = defineComponent<Props>({
  name: 'RouterLink',

  setup(props) {
    // 从全局注入获取 router 实例
    const router = inject<Router>(routerKey)!

    // 根据 props.to 解析出目标路由对象
    const to = router.resolve(props.to)

    /**
     * 点击事件处理函数
     */
    const navigate = (e: MouseEvent) => {
      // 阻止默认 a 标签跳转行为
      e.preventDefault()
      if (props.replace) {
        router.replace(to) // 替换当前历史记录
      } else {
        router.push(to) // 新增历史记录
      }
    }

    // 处理 class
    /** 注入当前路由 */
    const currentRoute = inject(routeLocationKey)!
    // 是否精准匹配
    const isExactActive = computed({
      get: () => {
        return currentRoute.value.fullPath === to.fullPath
      },
    })
    // 是否模糊匹配
    const isActive = computed({
      get: () => {
        return isExactActive.value || currentRoute.value.path.startsWith(to.path + '/')
      },
    })
    const className = computed({
      get: () => {
        const classNamesArr: string[] = []
        if (isExactActive.value) {
          classNamesArr.push('router-link-exact-active')
        }
        if (isActive.value) {
          classNamesArr.push('router-link-active')
        }

        return classNamesArr.join(' ')
      },
    })

    // 返回渲染函数（JSX/Render Function）
    return () => {
      // 显示的文本内容
      // TODO: 改为 slot
      const children = to.name ?? to.path

      // 返回一个 a 标签
      return h(
        'a',
        {
          href: typeof props.to === 'string' ? props.to : router.resolve(props.to).fullPath,
          onClick: navigate,
          class: className.value,
        },
        children
      )
    }
  },
})
