# @purevue/compiler-core

## 📖 Introduction

This package is the **template compiler core** of [PureVue](https://www.npmjs.com/package/@purevue/vue).  
It contains the core logic for compiling Vue templates into render functions, including:

- Parsing template strings into an **AST**
- Applying **transform passes**
- Generating **JavaScript render functions** (codegen)

> ⚠️ Note: This project is for **learning purposes only**.  
> It is **not intended for production use**.

---

## 🔗 Usage

You normally don’t install this package directly.  
Instead, use the aggregate entry package:

👉 [@purevue/vue](https://www.npmjs.com/package/@purevue/vue)

For usage examples, check the demo:  
👉 [purevue-demo](https://github.com/himipeng/purevue-demo)

---

## 📦 Related Packages

- [@purevue/compiler-dom](https://www.npmjs.com/package/@purevue/compiler-dom) – Compiler optimized for browsers  
- [@purevue/compiler-sfc](https://www.npmjs.com/package/@purevue/compiler-sfc) – SFC (`.vue`) compiler  
- [@purevue/runtime-core](https://www.npmjs.com/package/@purevue/runtime-core) – Core runtime (components, VDOM)  
- [@purevue/vue](https://www.npmjs.com/package/@purevue/vue) – **Aggregate entry (recommended)**
