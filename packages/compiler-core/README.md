在 Vue 3 中，一个组件的模板经历了以下处理步骤：
template (模板字符串)
     ↓ 词法分析 (Lexer)
Tokens 流
     ↓ 语法分析 (Parser)
AST（抽象语法树）
     ↓ 优化 (Optimizer)
标记动态与静态节点的 AST
     ↓ 代码生成 (Codegen)
渲染函数代码 (VNode 渲染函数)
     ↓ 运行时 (Runtime)
真实 DOM 渲染和更新

简化
template (字符串)
   ↓ parse
AST
   ↓ render
patch 到 DOM

解析阶段（Parse）
解析阶段的核心是 baseParse 函数，它将模板字符串转换为一个抽象语法树（AST）。
baseParse 会先创建一个解析上下文 ParserContext（含有原始模板字符串、行列信息、解析选项等），然后调用 parseChildren 递归分析模板内容，生成一个 RootNode AST。

转换阶段（Transform）
在解析生成 AST 后，编译器进入转换阶段。Vue 通过 transform(ast, options) 函数对 AST 进行遍历和修改，添加代码生成所需的信息 ￼。转换阶段的主要工作包括：应用各种节点转换插件（node transform）和指令转换插件（directive transform），标记静态节点（静态提升）、生成 patchFlag 和 dynamicChildren（Block 机制）等以优化更新性能

Parse 阶段产生的 AST 是语法树，未包含“如何生成渲染函数”的信息。Transform 阶段的目标是：
	•	收集运行时 helper（例如 toDisplayString、openBlock、createElementVNode）；
	•	将表达式调整为运行时可直接使用的形式（例如给标识符加上 _ctx. 前缀）；
	•	为生成阶段准备 codegenNode（即每个节点对应的“代码生成模板/表达式”）；
	•	做一些优化（合并文本、静态提升、 Block/patchFlag 标记等）。


生成阶段（Codegen）
在 AST 被转换和优化后，编译器进入生成阶段。这里的目标是将转换后的 AST 转换为 JavaScript 渲染函数的源码字符串。Vue 使用 generate(root, options) 来完成这一步，其核心是：创建一个代码生成上下文（包含 push、indent、deindent 等方法），然后递归地遍历 AST 中的 codegenNode，拼接成最终的函数代码

