import {
  ElementTypes,
  NodeTypes,
  type CallExpression,
  type CompoundExpressionNode,
  type ElementNode,
  type InterpolationNode,
  type Property,
  type SimpleExpressionNode,
  type TemplateChildNode,
  type TextNode,
  type VNodeCall,
} from '@/types/compiler-core/ast'
import { isString } from '../../utils'

/**
 * 创建简单表达式节点
 * @param content 表达式内容
 * @param isStatic 是否静态表达式
 */
export function createSimpleExpression(content: string, isStatic: boolean): SimpleExpressionNode {
  return {
    type: NodeTypes.SIMPLE_EXPRESSION,
    content,
    isStatic,
    loc: undefined!,
  }
}

/**
 * 创建对象属性节点，用于表示对象字面量中的一对 key-value
 * @param key SimpleExpressionNode，表示属性名
 * @param value SimpleExpressionNode，表示属性值
 * @returns PropertyNode 对象
 */
export function createObjectProperty(key: Property['key'], value: Property['value']): Property {
  return {
    type: NodeTypes.JS_PROPERTY,
    key: typeof key === 'string' ? createSimpleExpression(key, true) : key,
    value,
  }
}

/**
 * 创建复合表达式节点
 * @param children 字符串或表达式节点数组，表示拼接内容
 * @returns CompoundExpressionNode 对象
 */
export function createCompoundExpression(children: CompoundExpressionNode['children']): CompoundExpressionNode {
  return {
    type: NodeTypes.COMPOUND_EXPRESSION,
    children,
  }
}

/**
 * 创建一个 JS 调用表达式 AST 节点
 * @param callee 调用的函数名，可以是字符串或 runtime helper 符号
 * @param args 调用参数数组
 * @returns CallExpression AST 节点
 */
export function createCallExpression(callee: string | symbol, args: any[] = []): CallExpression {
  return {
    type: NodeTypes.JS_CALL_EXPRESSION,
    callee,
    arguments: args,
  }
}

export function createInterpolation(content: InterpolationNode['content'] | string): InterpolationNode {
  return {
    type: NodeTypes.INTERPOLATION,
    content: isString(content) ? createSimpleExpression(content, false) : content,
  }
}

export function createElementNode(
  tag: ElementNode['tag'],
  props: ElementNode['props'],
  children: ElementNode['children'],
  tagType: ElementNode['tagType'] = ElementTypes.ELEMENT
): ElementNode {
  // 判断是普通元素还是组件
  if (tag === 'slot') {
    tagType = ElementTypes.SLOT
  } /* else if (isFragmentTemplate(node)) {
    tagType = ElementTypes.TEMPLATE
  } */ else if (isComponent(tag)) {
    tagType = ElementTypes.COMPONENT
  }

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
    tagType,
  }
}

/**
 * 判断一个 AST 节点是否是组件
 * @param node ElementNode
 * @returns boolean
 */
export function isComponent(tag: ElementNode['tag']): boolean {
  // 1. 大写字母开头（PascalCase）视为组件
  if (/^[A-Z]/.test(tag)) {
    return true
  }

  // 2. 可能是 kebab-case 自定义组件（比如 my-button）
  // 规则：标签中包含 "-"（HTML 保留标签名一般不含 -，除 web component 外）
  if (tag.includes('-')) {
    return true
  }

  // 3. 内置组件
  const builtInComponents = new Set(['KeepAlive', 'Teleport', 'Suspense'])
  if (builtInComponents.has(tag)) {
    return true
  }

  // 其他情况视为普通元素
  return false
}

export function createTextNode(content: TextNode['content']): TextNode {
  return {
    type: NodeTypes.TEXT,
    content,
  }
}

/**
 * 创建 VNode 调用表达式
 */
export function createVNodeCall(
  tag: VNodeCall['tag'],
  props: VNodeCall['props'],
  children: any,
  _patchFlag?: any
): VNodeCall {
  // TODO: patchFlag 用于 diff
  return {
    type: NodeTypes.VNODE_CALL,
    tag,
    props,
    children,
  }
}

/**
 * 代码生成阶段的配置选项
 */
export interface CodegenOptions {
  /**
   * 生成模式：
   * - 'function'：生成可用 new Function 执行的渲染函数代码（运行时编译）
   * - 'module'：生成包含 import/export 的 ES 模块代码（预编译/构建时使用）
   * @default 'function'
   */
  mode?: 'function' | 'module'
  /**
   * 编译目标环境是否是浏览器
   * 用于控制导入/导出等生成逻辑
   * @default false
   */
  isBrowser?: boolean
  /**
   * 运行时模块名（通常为 "vue"）
   * 在 module 模式下用于生成 import 语句
   * @default 'vue'
   */
  runtimeModuleName?: string
  /**
   * 在 UMD / IIFE 或全局环境下访问 Vue runtime 的全局变量名
   * 比如 window.Vue 或 globalThis.Vue
   * 默认 'Vue'
   */
  runtimeGlobalName?: string
  /**
   * 是否启用 import 助手函数的优化（webpack code-split 时用）
   * @default false
   */
  optimizeImports?: boolean
  /**
   * 是否生成源码位置（开发调试用）
   * @default false
   */
  sourceMap?: boolean
  /**
   * 缩进级别（用于生成格式化代码）
   * @default 0
   */
  indentLevel?: number
  /**
   * 模板源代码（用于生成代码位置映射）
   */
  source?: string
}

export function isText(node: TemplateChildNode): node is TextNode | InterpolationNode {
  return node.type === NodeTypes.INTERPOLATION || node.type === NodeTypes.TEXT
}
