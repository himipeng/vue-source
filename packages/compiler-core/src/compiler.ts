import type { CompilerOptions, RootNode } from './types'
import { baseParse } from './parse'
import { isString } from '@purevue/shared'
import { transform } from './transform'
import { generate, type CodegenResult } from './codegen'

/**
 * 编译模板字符串或 AST 根节点，生成渲染函数代码。
 *
 * @param {string | RootNode} source - 模板字符串或已经解析好的 AST 根节点。
 * @returns {string} 生成的渲染函数代码字符串。
 *
 * 该函数执行以下步骤：
 * 1. 如果传入的是字符串，则调用 `baseParse` 将模板解析成 AST。
 * 2. 对 AST 进行转换，执行各种编译阶段的转换操作。
 * 3. 根据转换后的 AST 生成最终的代码字符串。
 */
export function baseCompile(source: string | RootNode, options: CompilerOptions = {}): CodegenResult {
  // 判断传入的 source 是否为字符串，如果是，则解析成 AST，否则直接使用传入的 AST
  const ast = isString(source) ? baseParse(source) : source

  // 对 AST 进行转换，处理指令、表达式等编译阶段的转换逻辑
  transform(ast)

  // 根据转换后的 AST 生成渲染函数代码
  const res = generate(ast, options)

  return res
}
