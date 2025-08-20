import {
  type TemplateChildNode,
  type SimpleExpressionNode,
  type InterpolationNode,
  type TextNode,
  type RootNode,
  type CompoundExpressionNode,
  NodeTypes,
} from '@/types/compiler-core/ast'
import type { CodegenOptions } from '../ast'
import { CREATE_VNODE, helperNameMap, RESOLVE_COMPONENT, TO_DISPLAY_STRING } from '@vue/runtime-core'

/**
 * Codegen 阶段：将 transform 阶段生成的带 codegenNode 的 AST
 * 转换为最终的渲染函数源码字符串。
 */

/**
 * Codegen 上下文，维护代码缓冲、缩进、辅助函数引用等状态
 */
interface CodegenContext {
  /**
   * 代码生成模式：
   * - 'function' 表示生成渲染函数（适用于运行时编译模式）
   * - 'module' 表示生成 ES 模块 import/export（适用于打包模式/预编译）
   */
  mode: 'function' | 'module'
  /** 模板源代码字符串，可用于调试或生成代码时引用 */
  source: string
  /** 最终生成的代码字符串 */
  code: string
  /** 运行时模块名称，用于生成 import 或 require 语句 */
  runtimeModuleName: string
  /** 运行时全局变量名，用于运行时编译模式下访问 Vue 对象 */
  runtimeGlobalName: string
  /** 向代码缓冲中追加代码 */
  push: (source: string) => void
  /** 添加换行符并缩进 */
  newline: () => void
  /** 增加缩进级别 */
  indent: () => void
  /** 减少缩进级别 */
  deindent: () => void
  /** 获取 runtime helper 的本地引用 */
  helper(key: symbol): string
}

/**
 * Codegen 结果接口
 */
export interface CodegenResult {
  code: string
  preamble: string
  ast: RootNode
}

/**
 * 创建 CodegenContext，负责代码字符串管理与缩进控制
 * @returns CodegenContext 实例
 */
function createCodegenContext(ast: RootNode, options?: CodegenOptions): CodegenContext {
  const codeParts: string[] = []
  let indentLevel = 0

  const { mode = 'function', runtimeGlobalName = `Vue`, runtimeModuleName = `vue` } = options || {}

  const context: CodegenContext = {
    mode,
    code: '',
    runtimeModuleName,
    runtimeGlobalName,
    source: ast.source,
    push(source: string) {
      codeParts.push(source)
      context.code = codeParts.join('')
    },
    newline() {
      codeParts.push('\n' + '  '.repeat(indentLevel))
      context.code = codeParts.join('')
    },
    indent() {
      indentLevel++
    },
    deindent() {
      indentLevel = Math.max(0, indentLevel - 1)
    },
    helper(key: symbol) {
      // 对应转换阶段收集的辅助函数，避免与用户变量冲突
      return `_${helperNameMap[key]}`
    },
  }

  return context
}

/**
 * 生成渲染函数的入口函数
 * @param root 已经经过 transform 的 Root AST，包含 codegenNode 与 helpers
 * @returns 生成的渲染函数源码字符串
 */
export function generate(root: RootNode, options: CodegenOptions = {}): CodegenResult {
  const context = createCodegenContext(root, options)

  const { mode } = context

  // 根据 mode 决定 preamble 生成方式
  if (mode === 'module') {
    // 模块化构建模式，生成 import 语句 + 绑定优化
    genModulePreamble(root, context)
  } else {
    // 运行时编译模式 / 浏览器直接执行模板
    genFunctionPreamble(root, context)
  }

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')
  context.push(`function ${functionName}(${signature}) {`)

  // 生成函数主体：根据 codegenNode 生成渲染逻辑
  if (!root.codegenNode) {
    // 无 codegenNode 时，渲染函数返回 null
    context.push('return null')
  } else {
    context.push('return ')
    genNode(root.codegenNode, context)
  }

  // 4. 结束函数体
  context.deindent()
  context.push('}')

  return {
    code: context.code,
    ast: root,
    preamble: '', // TODO
  }
}

/**
 * 生成模块导入前言，根据 root.helpers 生成 import 语句
 * @param ast AST 根节点，包含 helpers 数组
 * @param ctx Codegen 上下文
 */
function genModulePreamble(ast: RootNode, ctx: CodegenContext) {
  const { runtimeModuleName, push, newline } = ctx
  const helpers = Array.from(ast.helpers)

  // 生成 import 语句
  push(`import { ${helpers.join(', ')} } from ${JSON.stringify(runtimeModuleName)}\n`)
  // 生成 const _xxx = xxx
  push(`const ${helpers.map((name) => `_${helperNameMap[name]} = ${helperNameMap[name]}`).join(', ')}\n`)

  newline()
  push(`export `)
}

/**
 * 将 helper 名称映射为别名，例如 foo -> foo: _foo
 * @param s helper 名称
 * @returns 别名字符串
 */
const aliasHelper = (s: symbol) => `${helperNameMap[s]}: _${helperNameMap[s]}`

/**
 * 生成渲染函数的声明部分
 * @param root AST 根节点
 * @param ctx Codegen 上下文
 */
function genFunctionPreamble(ast: RootNode, ctx: CodegenContext) {
  const { runtimeGlobalName } = ctx
  const helpers = Array.from(ast.helpers)
  if (helpers.length > 0) {
    ctx.push(`const { ${helpers.map(aliasHelper).join(', ')} } = ${runtimeGlobalName}\n`)
  }

  ctx.newline()

  // 为渲染函数生成 return 关键字
  ctx.push(`return `)
}

/**
 * 根据 codegenNode 类型分发生成对应代码
 * @param node codegenNode 节点
 * @param ctx Codegen 上下文
 */
function genNode(node: TemplateChildNode, ctx: CodegenContext) {
  if (!node) return
  switch (node.type) {
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, ctx)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, ctx)
      break
    case NodeTypes.TEXT:
      genText(node, ctx)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, ctx)
      break
    case NodeTypes.JS_OBJECT_EXPRESSION:
      genObjectExpression(node, ctx)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, ctx)
      break
    default:
      // TODO: 拓展其他类型
      ctx.push('null')
  }
}

/**
 * 判断 tag 是否是用户组件占位符
 * Vue3 编译阶段常用 `_component_X` 作为占位符
 * @param tag vnode.tag
 */
function isComponentTag(tag: string): boolean {
  // 简化判断：以 `_component_` 开头的都是用户组件
  return typeof tag === 'string' && tag.startsWith('_component_')
}

/**
 * 获取真实组件名
 * @param tag vnode.tag
 */
function getComponentName(tag: string): string {
  if (!isComponentTag(tag)) return tag
  return tag.replace(/^_component_/, '')
}

/**
 * 生成虚拟节点调用的代码
 * @param node VNodeCall 类型节点
 * @param context 代码生成上下文
 */
function genVNodeCall(node: any, context: CodegenContext) {
  const { push, helper } = context
  // 生成 createElementVNode 函数调用代码
  push(`${helper(CREATE_VNODE)}(`)

  // 参数1：type 节点类型
  // 如果是组件，需要把 __component__xx 解析为 xx 组件的 options
  if (isComponentTag(node.tag)) {
    // 调用 helper 生成 resolveComponent 引用
    const resolveComp = helper(RESOLVE_COMPONENT)
    push(`${resolveComp}('${getComponentName(node.tag)}', _ctx)`)
  } else {
    push(JSON.stringify(node.tag))
  }
  push(', ')

  // 参数2：prop 处理节点的属性
  if (node.props) {
    genNode(node.props, context)
  } else {
    push('null')
  }

  push(', ')

  // 参数3：处理节点的子节点
  if (node.children && node.children.length) {
    if (node.children.length === 1) {
      genNode(node.children[0], context)
    } else {
      push('[')
      node.children.forEach((child: any, i: number) => {
        genNode(child, context)
        if (i < node.children.length - 1) push(', ')
      })
      push(']')
    }
  } else {
    push('null')
  }

  push(')')
}

/**
 * 生成文本节点代码，直接字符串化
 * @param node TextNode 节点
 * @param ctx Codegen 上下文
 */
function genText(node: TextNode, ctx: CodegenContext) {
  ctx.push(JSON.stringify(node.content))
}

/**
 * 生成对象表达式的代码
 * @param node ObjectExpression 类型节点
 * @param context 代码生成上下文
 */
function genObjectExpression(node: any, context: CodegenContext) {
  const { push } = context
  push('{')
  node.properties.forEach((prop: any, i: number) => {
    genNode(prop.key, context)
    push(': ')
    genNode(prop.value, context)
    if (i < node.properties.length - 1) push(', ')
  })
  push('}')
}

/**
 * 生成复合表达式（CompoundExpression）的代码
 * @param node CompoundExpressionNode 节点
 * @param context CodegenContext 上下文
 */
function genCompoundExpression(node: CompoundExpressionNode, context: CodegenContext) {
  // 遍历 children，字符串直接输出，节点递归调用 genNode
  node.children.forEach((child: any) => {
    if (typeof child === 'string') {
      // 字符串片段直接输出
      context.push(child)
    } else {
      // 嵌套表达式递归处理
      genNode(child, context)
    }
  })
}

/**
 * 生成简单表达式代码
 * @param node SimpleExpressionNode 节点
 * @param ctx Codegen 上下文
 */
function genExpression(node: SimpleExpressionNode, context: CodegenContext) {
  const { content, isStatic } = node
  context.push(isStatic ? JSON.stringify(content) : content)
}

/**
 * 生成插值表达式代码，调用 toDisplayString helper
 * @param node InterpolationNode 节点
 * @param ctx Codegen 上下文
 */
function genInterpolation(node: InterpolationNode, context: CodegenContext) {
  context.push(`${context.helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  context.push(`)`)
}
