import { baseCompile, type CodegenResult } from '@pure-vue/compiler-core'
import type { CompilerOptions, RootNode } from '@pure-vue/compiler-core'

export function compile(src: string | RootNode, options: CompilerOptions = {}): CodegenResult {
  return baseCompile(src, options)
}
