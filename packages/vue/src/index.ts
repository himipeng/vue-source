/**
 * 整个 Vue 框架的 聚合入口包
 * 只聚合「对用户公开的 API」
 */

// 默认导出 runtime-dom 的所有 API
// export * from '@pure-vue/runtime-dom'

// 补充 reactivity 的 API
export * from '@pure-vue/reactivity'

export * from '@pure-vue/runtime-core'

export { toDisplayString } from '@pure-vue/runtime-dom'

// 暴露部分编译器 API（仅完整构建版本才有）
export { compile } from '@pure-vue/compiler-dom'

export * from './createApp'
