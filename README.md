# **Mini Vue3 — 从零实现 Vue3 核心机制**



一个从零手写的 **迷你版 Vue3**，包含 reactivity、runtime-core、compiler-core、SFC 编译 等核心模块，完整跑通 Vue3 的渲染链路，帮助理解其内部原理与设计思想。



## **✨ 项目亮点**





- 🔧 **手写响应式系统**

  实现 reactive / effect / ref / computed / track & trigger 等响应式能力，完整复刻依赖追踪模型。

- 🧠 **实现 runtime-core**

  支持虚拟 DOM、组件系统、patch 机制、异步更新队列等，实现基本的渲染与 diff 流程。

- 🏗 **实现 compiler-core**

  支持模板解析（parse）、AST 转换（transform）、代码生成（codegen）等核心编译能力。

- 📦 **手写 SFC 编译流程**

  编写简化版 vite-plugin-vue，支持编译 .vue 文件，使项目能够在浏览器中真实运行。

- 🚀 **可运行 Demo**

  项目不是示例代码散装，而是一个 **能够构建、能运行、能渲染** 的完整 mini-vue3。





## **🧪 功能概览**



- 响应式系统：

  reactive、readonly、ref、effect、computed、track/trigger

- 渲染系统：

  h、mount、patch、diff 算法、组件实例、Props & Slots

- 编译系统：

  词法解析 → AST → 节点转换 → 代码生成 → 渲染函数

- SFC 支持：

  模板编译 + script 解析 + 样式处理

  支持以插件形式运行（类 vite 插件）

