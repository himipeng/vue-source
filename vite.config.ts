import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@vue': fileURLToPath(new URL('./src/code', import.meta.url)),
      vue: fileURLToPath(new URL('./src/code', import.meta.url)),
      'vue-router': fileURLToPath(new URL('./src/code/vue-router', import.meta.url)),
    },
  },
})
