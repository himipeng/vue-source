# @purevue/compiler-sfc

## 📖 Introduction

This package is the **Single-File Component (SFC) compiler** of [PureVue](https://www.npmjs.com/package/@purevue/vue).  
It parses `.vue` files and compiles them into JavaScript modules that can be processed by bundlers like Vite.

Key features:
- Parses `<template>` and `<script>` blocks from `.vue` files
- Compiles templates into **render functions**
- Designed to work together with [@purevue/vite-plugin](https://www.npmjs.com/package/@purevue/vite-plugin)

> ⚠️ Note: This project is for **learning purposes only**.  
> It is **not intended for production use**.

---

## 🔗 Usage

You usually won’t install this package directly.  
Instead, use it via the Vite plugin:  

👉 [@purevue/vite-plugin](https://www.npmjs.com/package/@purevue/vite-plugin)

Or simply use the aggregate entry package:  

👉 [@purevue/vue](https://www.npmjs.com/package/@purevue/vue)

For examples, check the demo project:  
👉 [purevue-demo](https://github.com/himipeng/purevue-demo)

---

## 📦 Related Packages

- [@purevue/compiler-core](https://www.npmjs.com/package/@purevue/compiler-core) – Template compiler core  
- [@purevue/compiler-dom](https://www.npmjs.com/package/@purevue/compiler-dom) – DOM template compiler  
- [@purevue/vite-plugin](https://www.npmjs.com/package/@purevue/vite-plugin) – Vite plugin for `.vue` files  
- [@purevue/vue](https://www.npmjs.com/package/@purevue/vue) – **Aggregate entry (recommended)**