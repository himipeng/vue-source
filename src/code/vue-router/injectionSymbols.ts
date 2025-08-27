/** 用于提供 RouterView 的嵌套深度 */
export const viewDepthKey = Symbol('viewDepth')

/** 用于提供当前路由对象 */
export const routerViewLocationKey = Symbol('routerViewLocation')

/** 用用于提供当前匹配的路由记录 */
export const matchedRouteKey = Symbol('matchedRoute')

/** 当前路由器 */
export const routerKey = Symbol('router')
