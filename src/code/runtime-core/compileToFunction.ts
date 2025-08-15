import type { CompilerOptions } from '@/types/compiler-core'
import type { RenderFunction } from '@/types/runtime-core'
import { isString } from '@/utils'
import { baseCompile } from '@vue/compiler-core'
import * as runtimeDom from '@vue/runtime-dom'

/**
 * 将模板字符串或 HTMLElement 编译为渲染函数
 *
 * @param {string | HTMLElement} template - 模板字符串或者包含模板的 HTMLElement
 * @param {CompilerOptions} [options] - 编译选项
 * @returns {RenderFunction} 编译生成的渲染函数
 */
export function compileToFunction(template: string | HTMLElement, options?: CompilerOptions): RenderFunction {
  if (!isString(template)) {
    if (template.nodeType) {
      template = template.innerHTML
    } else {
      return () => {}
    }
  }

  // 生成缓存 key，基于模板字符串和编译选项，避免重复编译。
  const key = genCacheKey(template, options)
  // 查询缓存，若存在对应的渲染函数则直接返回，提升性能。
  const cached = compileCache[key]
  if (cached) {
    return cached
  }

  // 调用 baseCompile 编译模板字符串，生成渲染函数代码。
  const { code } = baseCompile(template)

  // 使用 new Function 动态执行编译代码，生成渲染函数。
  // Vue 为形参，runtimeDom 为实参，code 为函数体
  const render = new Function('Vue', code)(runtimeDom) as RenderFunction

  // 将生成的渲染函数缓存，并返回。
  return (compileCache[key] = render)
}

/**
 * 缓存编译后的渲染函数，避免重复编译同一模板
 * key 为模板字符串和编译选项的组合
 */
const compileCache: Record<string, RenderFunction> = Object.create(null)

/**
 * 根据模板字符串和编译选项生成缓存用的唯一 key
 *
 * @param {string} source - 模板字符串
 * @param {any} options - 编译选项对象
 * @returns {string} 缓存 key，用于唯一标识模板和选项组合
 */
function genCacheKey(source: string, options: any): string {
  return source + JSON.stringify(options, (_, val) => (typeof val === 'function' ? val.toString() : val))
}
