import type { ComponentPublicInstance } from '@purevue/vue'
import { computed, defineComponent, h, inject, provide, Ref, ref, unref } from '@purevue/vue'
import type { RouteLocationNormalizedLoaded, RouteRecord } from '../types'
import { matchedRouteKey, routerViewLocationKey, viewDepthKey } from '../injectionSymbols'

interface Props {
  /** 视图名 */
  name?: string
  /** 渲染路由 */
  route?: RouteLocationNormalizedLoaded
}

export const RouterView = defineComponent<Props>({
  name: 'RouterView',
  setup(props, { attrs }) {
    const name = ref(props.name || 'default')
    /** 注入当前路由（由上层 Router 或 RouterView 提供） */
    const injectedRoute = inject<Ref<RouteLocationNormalizedLoaded>>(routerViewLocationKey)!

    /** 当前要渲染的路由（优先用 props.route，否则用注入的路由） */
    const routeToDisplay = computed(() => props.route || injectedRoute.value)

    /** 注入父级的 depth（默认 0，表示最外层 RouterView） */
    const injectedDepth = inject(viewDepthKey, 0)!

    /** 当前 RouterView 的深度 */
    const depth = computed(() => unref(injectedDepth))

    /** 向子 RouterView 提供深度（+1，保证嵌套时子级正确渲染） */
    provide(
      viewDepthKey,
      computed(() => depth.value + 1)
    )

    /** 向子 RouterView 提供当前路由 */
    provide(routerViewLocationKey, routeToDisplay)

    /** 保存当前渲染的组件实例 */
    // 赋值给 vnode props
    // TODO: Vue 在渲染这个 ViewComponent 的时候，会自动把它的组件实例对象赋值给 viewRef.value
    const viewRef = ref<ComponentPublicInstance>()

    /** 当前匹配到的路由记录（根据 depth 取） */
    const matchedRouteRef = computed<RouteRecord | undefined>({
      get: () => routeToDisplay.value?.matched[depth.value],
    })

    /** 向子 RouterView 提供当前匹配的路由记录 */
    provide(matchedRouteKey, matchedRouteRef)

    return () => {
      const route = routeToDisplay.value
      const matchedRoute = matchedRouteRef.value
      if (!matchedRoute) {
        // console.warn(`[RouterView]: 当前路由深度${depth.value}未匹配到路由记录`)
        return null
      }

      /** 根据路由记录和 name 取出对应的组件 */
      const ViewComponent = matchedRoute.components?.[name.value]
      if (!ViewComponent) {
        console.warn(`[RouterView]: 当前路由视图[${name.value}]未匹配到组件`)
        return null
      }

      // TODO: 支持 slot

      /** 如果路由配置了 props，则将其传递给组件 */
      const routeProps =
        matchedRoute.props?.[name.value] === true ? route.params : matchedRoute.props?.[name.value] ?? null

      /** 渲染目标组件 */
      return h(ViewComponent, { ...routeProps, ...attrs, ref: viewRef })
    }
  },
})
