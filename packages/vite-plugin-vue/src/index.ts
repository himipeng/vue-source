import type { Plugin } from 'vite'
import { compileSFC } from '@purevue/compiler-sfc'
import { transformWithEsbuild } from 'vite'

export default function vuePlugin(): Plugin {
  return {
    name: 'vite-plugin-vue',

    async transform(code, id) {
      if (!id.endsWith('.vue')) return

      // 1. 用你自己的 compiler-sfc 拆分 .vue
      const transformedTS = compileSFC(code, id)

      // 2. 调用 Vite 内置的 esbuild transform 将 TypeScript 转为 JavaScript
      const result = await transformWithEsbuild(transformedTS, id, {
        loader: 'ts',
        sourcemap: true,
      })

      return {
        code: result.code,
        map: result.map,
      }
    },
  }
}
