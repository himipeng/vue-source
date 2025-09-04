import { baseCompile, type CodegenResult } from '../compiler-core'
import type { CompilerOptions, RootNode } from '../types'

export function compile(src: string | RootNode, options: CompilerOptions = {}): CodegenResult {
  return baseCompile(src, options)
}
