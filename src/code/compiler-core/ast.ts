import type {
  CompoundExpressionNode,
  ElementNode,
  InterpolationNode,
  PropertyNode,
  SimpleExpressionNode,
} from '@/types/compiler-core'
import { isString } from '../../utils'

/**
 * 创建简单表达式节点
 * @param content 表达式内容
 * @param isStatic 是否静态表达式
 */
export function createSimpleExpression(content: string, isStatic: boolean): SimpleExpressionNode {
  return {
    type: 'SimpleExpression',
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
export function createObjectProperty(key: PropertyNode['key'], value: PropertyNode['value']): PropertyNode {
  return {
    type: 'Property',
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
    type: 'CompoundExpression',
    children,
  }
}

export function createInterpolation(content: InterpolationNode['content'] | string): InterpolationNode {
  return {
    type: 'Interpolation',
    content: isString(content) ? createSimpleExpression(content, false) : content,
  }
}

export function createElementNode(
  tag: ElementNode['tag'],
  props: ElementNode['props'],
  children: ElementNode['children']
): ElementNode {
  return {
    type: 'Element',
    tag,
    props,
    children,
  }
}

/**
 * 创建 VNode 调用表达式
 */
export function createVNodeCall(tag: string, props: any, children: any): any {
  return {
    type: 'VNodeCall',
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
