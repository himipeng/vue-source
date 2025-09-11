# @purevue/vite-plugin

## 📖 Introduction

This package provides the **Vite plugin** for handling `.vue` Single-File Components in [PureVue](https://www.npmjs.com/package/@purevue/vue).

Key features:

- Parses and compiles `.vue` files during development and build
- Delegates SFC parsing to [@purevue/compiler-sfc](https://www.npmjs.com/package/@purevue/compiler-sfc)
- Integrates directly with the Vite build pipeline

> ⚠️ Note: This project is for **learning purposes only**.  
> It is **not intended for production use**.

---

## 🔗 Usage

Add the plugin in your `vite.config.js`:

```ts
import { defineConfig } from 'vite'
import vue from '@purevue/vite-plugin'

export default defineConfig({
  plugins: [vue()],
})
```

Tthe aggregate package:

👉 @purevue/vue

For real-world usage examples, check the demo project:
👉 purevue-demo

⸻

📦 Related Packages
• @purevue/compiler-sfc – SFC parsing and compilation
• @purevue/vue – Aggregate entry (recommended)
