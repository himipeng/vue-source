import { baseCompile, type CodegenResult } from '@vue/compiler-core'
import type { CompilerOptions, RootNode } from '@vue/compiler-core'

export function compile(src: string | RootNode, options: CompilerOptions = {}): CodegenResult {
  return baseCompile(src, options)
}
