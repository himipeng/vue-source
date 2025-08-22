# Vue 3 编译器 AST 节点类型及作用

总结 Vue 3 模板编译阶段各 AST 节点类型及其作用，方便理解 Parse、Transform 和 Codegen 阶段的工作。

| AST 类型 | 阶段 | 作用说明 |
|----------|------|---------|
| **RootNode** | Parse / Transform | 根节点，保存模板源码、子节点列表、helper 集合、组件/指令列表、hoists 和最终 `codegenNode` |
| **ElementNode** | Parse | 模板标签节点（如 `<div>`、`<span>`），包含 `tag`、`props`、`children`、`tagType`（普通元素/组件/slot/template） |
| **PlainElementNode** | Parse / Transform | 普通 DOM 元素节点 |
| **ComponentNode** | Parse / Transform | 组件节点（`<MyComponent>`），在 Transform 阶段生成对应 `VNodeCall` |
| **SlotOutletNode** | Parse / Transform | 插槽节点 `<slot>` |
| **TemplateNode** | Parse / Transform | `<template>` 容器节点，最终会被编译消除 |
| **TextNode** | Parse | 普通文本节点，例如 `"hello world"` |
| **InterpolationNode** | Parse / Transform | 插值节点 `{{ name }}`，包含 `content: ExpressionNode` |
| **SimpleExpressionNode** | Parse / Transform | 解析后的简单表达式 `_ctx.name`，可静态/动态标记 |
| **CompoundExpressionNode** | Transform | 合并连续文本或插值，方便生成 `createTextVNode("hello " + _ctx.name)` |
| **DirectiveNode** | Parse / Transform | 指令节点，如 `v-if`、`v-for`、`v-model`，包含表达式、参数、修饰符 |
| **VNodeCall** | Codegen | 渲染函数生成节点，用于生成 `createVNode(tag, props, children)` 或 `createElementVNode` |
| **TextCallNode** | Transform / Codegen | 文本节点生成函数调用 `createTextVNode`，包含文本或 `CompoundExpressionNode` |
| **CallExpressionNode** | Codegen | 函数调用表达式节点，例如 `toDisplayString(_ctx.msg)` |
| **ObjectExpression / Property** | Transform / Codegen | 对象表达式节点，用于生成 props、指令参数等 |
| **ExpressionNode** | Parse / Transform | 简单或复合表达式的抽象类型，可嵌套在插值或指令中 |