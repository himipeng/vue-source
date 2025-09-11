# **@purevue/vue**

1. 

   - > [English](./README.md) | [简体中文](./README.zh-CN.md)

   

## **🔎 Project Overview**

- **PureVue (@purevue)** is a **learning-oriented reimplementation of Vue 3**.
  - The architecture and design closely follow the **official Vue source code**, but simplified for easier learning.
  - The goal is to help developers understand **Vue 3’s core mechanisms** (reactivity, virtual DOM, template compilation, etc.).
  - ⚠️ **For learning and research only, not for production use.**



------



## **📦 Package Overview**

- **@purevue/vue** is the **aggregated entry package** of the whole project:

  - Works like the official vue package
  - Bundles reactivity, runtime-core, runtime-dom, compiler, etc.
  - Provides APIs consistent with Vue 3 for easy comparison and study

  

⚠️ **Note**: @purevue/router and @purevue/vite-plugin are **not included** in this bundle. They must be **installed separately**.



------



## **🏗 Package Relationships**

**@purevue/vue** aggregates the following sub-packages:

- **@purevue/reactivity** – Reactivity system (ref, reactive, dependency tracking, etc.)
- **@purevue/runtime-core** – Runtime core (component system, virtual DOM)
- **@purevue/runtime-dom** – DOM rendering platform adapter
- **@purevue/compiler-core** – Core template compiler logic
- **@purevue/compiler-dom** – Browser-specific compiler implementation
- **@purevue/shared** – Utility functions and shared logic



Not aggregated (need separate installation):

- **@purevue/compiler-sfc** — SFC (.vue) parsing and build-time handling; build tool only, not part of runtime.
- **@purevue/vite-plugin** — Vite plugin for transforming .vue files into modules during dev/build; **depends on @purevue/compiler-sfc** and should be added as a **devDependency**.
- **@purevue/router** — Routing package, must be installed separately.



------



## **🎮 Demo**

👉 Example repo: [purevue-demo](https://github.com/himipeng/purevue-demo)

```bash
git clone https://github.com/himipeng/purevue-demo.git
cd purevue-demo
pnpm install
pnpm dev
```



------



## **🚀 Usage**

The APIs covered are consistent with the official Vue 3 APIs.  

For usage examples, please refer to the demo project.

```ts
import { createApp, ref } from '@purevue/vue'
// or use alias mapping to import from 'vue'
```



------



## **📝 TODO List**

### **Template Compiler**

| **Feature**                        | **DONE/TODO** |
| ---------------------------------- | ------------- |
| parse → transform → codegen        | ✅             |
| Runtime compilation                | ✅             |
| AST generation                     | ✅             |
| VNode generation                   | ✅             |
| Directive v-on / @click            | ✅             |
| Directive v-if / v-for             | ×             |
| Directive v-model, others          | ×             |
| Slots                              | ×             |
| Build-time SFC compilation（.vue） | ✅             |
| <script> support                   | ✅             |
| <script setup> support             | ×             |



### **Renderer**

| **Feature**             | **DONE/TODO** |
| ----------------------- | ------------- |
| createApp / mount       | ✅             |
| patch / h / createVNode | ✅             |
| Diff                    | ×             |



### **Reactivity System**

| **Feature**                                     | **DONE/TODO** |
| ----------------------------------------------- | ------------- |
| ref / reactive / computed / watch / watchEffect | ✅             |
| inject / provide                                | ✅             |
| scheduler / dep / ReactiveEffect                | ✅             |
| nextTick                                        | ×             |



### **Router**

| **Feature**        | **DONE/TODO** |
| ------------------ | ------------- |
| HTML5 History mode | ✅             |
| Hash mode          | ×             |
| Nested routes      | ✅             |
| Navigation guards  | ×             |
| Dynamic routes     | ×             |



------



## **💡 Features**

- ⚡ **Architecture almost identical to Vue 3** — closely follows the official design
- 📖 **Simplified for learning** — core features only, easier to read and debug
- 🛠 **Modular design** — sub-packages split like Vue 3
- 🎯 **Learning-first** — not meant for production use

