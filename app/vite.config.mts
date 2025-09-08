import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue-router': fileURLToPath(new URL('../packages/vue-router/src', import.meta.url)),
      // 可以加 alias，把子包直接指向源码，
      // 这样开发时， Vite 会直接用源码编译，不用每次改代码都要先跑 build
      // 否者走子包 package.json 的 main/module 指向的 dist 目录
      vue: fileURLToPath(new URL('../packages/vue/src', import.meta.url)),
      '@vue/shared': fileURLToPath(new URL('../packages/shared/src', import.meta.url)),
      '@vue/reactivity': fileURLToPath(new URL('../packages/reactivity/src', import.meta.url)),
      '@vue/runtime-core': fileURLToPath(new URL('../packages/runtime-core/src', import.meta.url)),
      '@vue/compiler-core': fileURLToPath(new URL('../packages/compiler-core/src', import.meta.url)),
      '@vue/compiler-dom': fileURLToPath(new URL('../packages/compiler-dom/src', import.meta.url)),
      '@vue/runtime-dom': fileURLToPath(new URL('../packages/runtime-dom/src', import.meta.url)),

      // 以下两个包应用于 vite.config(node 环境)，无法 alias 解析
      // 'vite-plugin-vue': fileURLToPath(new URL('../packages/vite-plugin-vue/src', import.meta.url)),
      // '@vue/compiler-sfc': fileURLToPath(new URL('../packages/compiler-sfc/src', import.meta.url)),
    },
  },
  plugins: [vue()],
})
