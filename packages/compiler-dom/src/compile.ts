import { baseCompile, type CodegenResult } from '@purevue/compiler-core'
import type { CompilerOptions, RootNode } from '@purevue/compiler-core'

export function compile(src: string | RootNode, options: CompilerOptions = {}): CodegenResult {
  return baseCompile(src, options)
}
