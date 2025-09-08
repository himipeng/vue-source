import type { Plugin } from 'vite'
import { compileSFC } from '@purevue/compiler-sfc'

export default function vuePlugin(): Plugin {
  return {
    name: 'vite-plugin-vue',

    // 在解析文件时调用
    transform(code, id) {
      if (id.endsWith('.vue')) {
        const transformed = compileSFC(code, id)
        return {
          code: transformed,
          map: null,
        }
      }
    },
  }
}
