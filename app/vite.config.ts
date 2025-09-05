import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: fileURLToPath(new URL('../packages/vue/src', import.meta.url)),
      'vue-router': fileURLToPath(new URL('../packages/vue-router/src', import.meta.url)),
      // '@vue/compiler-sfc': fileURLToPath(new URL('../packages/compiler-sfc/src/index.ts', import.meta.url)),
      // '@vue/compiler-dom': fileURLToPath(new URL('../packages/compiler-dom/src/index.ts', import.meta.url)),
      // '@vue/compiler-core': fileURLToPath(new URL('../packages/compiler-core/src/index.ts', import.meta.url)),
      // '@vue/runtime-dom': fileURLToPath(new URL('../packages/runtime-dom/src/index.ts', import.meta.url)),
      // '@vue/runtime-core': fileURLToPath(new URL('../packages/runtime-core/src/index.ts', import.meta.url)),
      // '@vue/reactivity': fileURLToPath(new URL('../packages/reactivity/src/index.ts', import.meta.url)),
      // '@vue/shared': fileURLToPath(new URL('../packages/shared/src/index.ts', import.meta.url)),
    },
  },
})
