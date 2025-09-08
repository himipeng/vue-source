/**
 * 整个 Vue 框架的 聚合入口包
 * 只聚合「对用户公开的 API」
 */

// 默认导出 runtime-dom 的所有 API
// export * from '@purevue/runtime-dom'

// 补充 reactivity 的 API
export * from '@purevue/reactivity'

export * from '@purevue/runtime-core'

export { toDisplayString } from '@purevue/runtime-dom'

// 暴露部分编译器 API（仅完整构建版本才有）
export { compile } from '@purevue/compiler-dom'

export * from './createApp'
