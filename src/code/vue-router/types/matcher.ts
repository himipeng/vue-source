import type { RouteLocationResolved } from './location'
import type { RouteRecordNormalized, RouteRecordRaw } from './route'

/**
 * Matcher 接口
 */
export interface RouteRecordMatcher {
  record: RouteRecordNormalized
  parent?: RouteRecordMatcher
  alias: RouteRecordMatcher[]
  re: RegExp
  keys: string[]
  stringify: (params?: Record<string, string>) => string
}

export type MatcherLocation = Pick<RouteLocationResolved, 'name' | 'path' | 'params' | 'meta' | 'matched'>
export type MatcherLocationRaw = Partial<MatcherLocation>

export interface RouterMatcherType {
  addRoute: (record: RouteRecordRaw, parent?: RouteRecordMatcher) => () => void
  removeRoute(matcher: string | RouteRecordMatcher): void
  clearRoutes: () => void
  getRoutes: () => RouteRecordMatcher[]
  getRecordMatcher: (name: string) => RouteRecordMatcher | undefined
  resolve: (location: MatcherLocationRaw, currentLocation: MatcherLocation) => MatcherLocation
}
