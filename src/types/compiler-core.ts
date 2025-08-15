/**
 * Vue3 模板编译器通用类型定义
 * 包含模板解析（Parse）和转换（Transform）阶段常用的 AST 类型与上下文类型。
 */

/**
 * 所有 AST 节点类型的联合类型
 */
export type Node =
  | ElementNode
  | TextNode
  | InterpolationNode
  | SimpleExpressionNode
  | DirectiveNode
  | VNodeCall
  | CompoundExpressionNode
  | ObjectExpressionNode

export interface RootNode extends BaseNode {
  type: 'Root'
  source: string
  children: Node[]
  helpers: Set<string>
  components: string[]
  directives: string[]
  hoists: (JSChildNode | null)[]
  codegenNode?: CodegenNode
}

/**
 * 代码生成用节点，描述如何生成渲染函数代码
 */
export type CodegenNode = VNodeCall | SimpleExpressionNode

/**
 * 元素节点，例如 <div id=\"app\"> ... </div>
 */
export interface ElementNode {
  type: 'Element'
  /**
   * 标签名，如 'div'、'span'、'MyComponent'
   */
  tag: string
  /**
   * 元素属性数组
   */
  props?: Prop[]
  /**
   * 子节点列表
   */
  children: Node[]
  /**
   * 代码生成用节点，描述如何生成渲染函数代码
   * codegenNode 是 Vue3 编译器 Transform 阶段 用来存储“生成渲染函数代码”的中间表达式节点。它描述了如何将当前 AST 节点转换成对应的渲染函数调用（JS 代码片段）
   */
  codegenNode?: CodegenNode
}

/**
 * 属性通用类型，包含普通属性和指令
 */
export type Prop = AttributeNode | DirectiveNode

/**
 * 普通属性节点，如 id="app"
 */
export interface AttributeNode {
  type: 'Attribute'
  /**
   * 属性名，如 'id'、'class'
   */
  name: string
  /**
   * 属性值，可能为空字符串表示布尔属性
   */
  value: string
}

/**
 * 文本节点，例如 "Hello World"
 */
export interface TextNode {
  type: 'Text'
  /**
   * 文本内容
   */
  content: string
}

/**
 * 插值节点，例如 {{ msg }}
 */
export interface InterpolationNode {
  type: 'Interpolation'
  /**
   * 插值内容，通常是一个简单表达式节点
   */
  content: ExpressionNode
}

/**
 * 简单表达式节点
 * 用于表达式内容，例如插值内部表达式、指令表达式等
 */
export interface SimpleExpressionNode {
  type: 'SimpleExpression'
  /**
   * 表达式字符串内容
   */
  content: string
  /**
   * 是否为静态表达式
   */
  isStatic: boolean
  /**
   * 源码位置，暂时可选
   */
  loc?: SourceLocation
}

/**
 * 指令节点，如 v-if、v-for、v-bind、v-on 等
 */
export interface DirectiveNode {
  type: 'Directive'
  /**
   * 指令名，不含 v- 前缀
   */
  name: string
  /**
   * 指令表达式，通常是 SimpleExpressionNode 或 undefined
   */
  exp?: SimpleExpressionNode
  /**
   * 指令参数，例如 v-on:click 中的 click
   */
  arg?: SimpleExpressionNode
  /**
   * 修饰符数组，如 v-on:click.stop 中的 stop
   */
  modifiers?: string[]
  /**
   * 源码位置，暂时可选
   */
  loc?: SourceLocation
}

/**
 * 代码生成阶段用的 VNode 调用节点
 * 表示渲染函数中调用的 createElementVNode/createElementBlock 等函数
 */
export interface VNodeCall {
  type: 'VNodeCall'
  /**
   * 标签，可以是字符串或者表达式
   */
  tag: string | SimpleExpressionNode
  /**
   * 属性对象或 null
   */
  props: Record<string, any> | null
  /**
   * 子节点，可以是字符串、数组或表达式
   */
  children: any
}

/**
 * 编译器解析时用的上下文
 * 保存剩余模板字符串
 */
export interface ParserContext {
  source: string
}

/**
 * 编译器 transform 阶段上下文
 * 保存运行时 helper 集合，父节点等信息
 */
export interface TransformContext {
  currentNode: RootNode | Node
  /**
   * 收集的 helper 函数名称集合
   */
  helpers: Set<string>
  /**
   * 当前节点的父节点
   */
  parent: RootNode | ElementNode | null
  /**
   * 当前遍历子节点的索引，可选
   */
  childIndex?: number
  /**
   * 注册 helper 函数名称
   * @param name helper 名称
   */
  helper(name: string): void
  /**
   * 节点转换插件列表
   */
  nodeTransforms: NodeTransform[]
  /**
   * 指令转换插件集合
   */
  directiveTransforms: Record<string, DirectiveTransform>
}

/**
 * 节点转换插件签名
 * 接受当前节点和上下文，支持返回后序钩子
 */
export type NodeTransform = (node: Node | RootNode, context: TransformContext) => (() => void) | void

/**
 * 指令转换插件签名
 * 接受指令节点、当前元素节点和上下文
 */
export type DirectiveTransform = (
  dir: DirectiveNode,
  node: ElementNode,
  context: TransformContext
) => { props: PropertyNode[] }

/**
 * 源码位置
 */
export interface SourceLocation {
  source: string
  start: Position
  end: Position
}

/**
 * 位置点
 */
export interface Position {
  line: number
  column: number
  offset: number
}

/**
 * 对象表达式节点
 * 代表一个 JS 对象字面量，例如 { id: "app", class: cls }
 */
export interface ObjectExpressionNode {
  type: 'ObjectExpression'
  properties: PropertyNode[]
}

/**
 * 对象属性节点
 * 代表对象的一个键值对属性，例如 id: "app"
 */
export interface PropertyNode {
  type: 'Property'
  key: SimpleExpressionNode
  value: JSChildNode
  // value: SimpleExpressionNode | ObjectExpressionNode | CallExpressionNode
}

/**
 * 函数调用表达式节点（简化版）
 * 代表函数调用，例如 toDisplayString(msg)
 */
export interface CallExpressionNode {
  type: 'CallExpression'
  callee: string | SimpleExpressionNode
  arguments: Array<SimpleExpressionNode | ObjectExpressionNode | CallExpressionNode>
}

// /**
//  * 基础表达式节点接口
//  * 所有表达式节点（如简单表达式、复合表达式、调用表达式等）都继承自该接口
//  */
export interface BaseNode {
  type: string
  loc?: SourceLocation
}

export type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode

/**
 * 复合表达式节点，表示由多个表达式或字符串拼接组成的表达式。
 * 例如：`$event => (handler($event))` 可以拆成多个字符串和表达式片段拼接。
 */
export interface CompoundExpressionNode extends BaseNode {
  type: 'CompoundExpression'
  children: (SimpleExpressionNode | CompoundExpressionNode | InterpolationNode | TextNode | string)[]
}

export type JSChildNode = VNodeCall | CallExpressionNode | ObjectExpressionNode | ExpressionNode

// export type CompilerOptions = ParserOptions & TransformOptions & CodegenOptions
export type CompilerOptions = any
