/**
 * Vue3 模板编译器通用类型定义
 * 包含模板解析（Parse）和转换（Transform）阶段常用的 AST 类型与上下文类型。
 */

export interface RootNode extends Node {
  type: NodeTypes.ROOT
  source: string
  children: TemplateChildNode[]
  helpers: Set<symbol>
  components: string[]
  directives: string[]
  hoists: (JSChildNode | null)[]
  codegenNode?: CodegenNode
}

/**
 * 所有 AST 节点类型的联合类型
 */
export type TemplateChildNode =
  | ElementNode
  | TextNode
  | InterpolationNode
  | SimpleExpressionNode
  | DirectiveNode
  | VNodeCall
  | CompoundExpressionNode
  | ObjectExpression

export interface Node {
  type: NodeTypes
  loc?: SourceLocation
}

export enum NodeTypes {
  ROOT = 'ROOT',
  ELEMENT = 'ELEMENT',
  TEXT = 'TEXT',
  SIMPLE_EXPRESSION = 'SIMPLE_EXPRESSION',
  INTERPOLATION = 'INTERPOLATION',
  ATTRIBUTE = 'ATTRIBUTE',
  DIRECTIVE = 'DIRECTIVE',
  COMPOUND_EXPRESSION = 'COMPOUND_EXPRESSION',
  VNODE_CALL = 'VNODE_CALL',
  JS_OBJECT_EXPRESSION = 'JS_OBJECT_EXPRESSION',
  JS_PROPERTY = 'JS_PROPERTY',
}

export enum ElementTypes {
  ELEMENT,
  COMPONENT,
  SLOT,
  TEMPLATE,
}

export type ElementNode = PlainElementNode | ComponentNode | SlotOutletNode | TemplateNode

export interface BaseElementNode extends Node {
  type: NodeTypes.ELEMENT
  tag: string
  tagType: ElementTypes
  props?: Array<AttributeNode | DirectiveNode>
  children: TemplateChildNode[]
  isSelfClosing?: boolean
}

export interface PlainElementNode extends BaseElementNode {
  tagType: ElementTypes.ELEMENT
  codegenNode?:
    | VNodeCall
    | SimpleExpressionNode // when hoisted
    | undefined
}

export interface ComponentNode extends BaseElementNode {
  tagType: ElementTypes.COMPONENT
  codegenNode?: VNodeCall | undefined
}

export interface SlotOutletNode extends BaseElementNode {
  tagType: ElementTypes.SLOT
  codegenNode?: undefined
}

export interface TemplateNode extends BaseElementNode {
  tagType: ElementTypes.TEMPLATE
  // TemplateNode is a container type that always gets compiled away
  codegenNode?: undefined
}

export interface TextNode extends Node {
  type: NodeTypes.TEXT
  content: string
}

export interface AttributeNode extends Node {
  type: NodeTypes.ATTRIBUTE
  name: string
  // value: TextNode | undefined
  value: string | undefined
}

export interface DirectiveNode extends Node {
  type: NodeTypes.DIRECTIVE
  name: string
  rawName?: string
  exp: ExpressionNode | undefined
  arg: ExpressionNode | undefined
  modifiers: SimpleExpressionNode[]
}

export interface SimpleExpressionNode extends Node {
  type: NodeTypes.SIMPLE_EXPRESSION
  content: string
  isStatic: boolean
  hoisted?: JSChildNode
  identifiers?: string[]
  isHandlerKey?: boolean
}

export interface InterpolationNode extends Node {
  type: NodeTypes.INTERPOLATION
  content: ExpressionNode
}

export interface CompoundExpressionNode extends Node {
  type: NodeTypes.COMPOUND_EXPRESSION
  children: (SimpleExpressionNode | CompoundExpressionNode | InterpolationNode | TextNode | string | symbol)[]
  identifiers?: string[]
  isHandlerKey?: boolean
  isStatic?: boolean
  content?: string
}

export interface VNodeCall extends Node {
  type: NodeTypes.VNODE_CALL
  tag: string | symbol
  props: PropsExpression | undefined
  children:
    | TemplateChildNode[] // multiple children
    | SimpleExpressionNode // hoisted
    | undefined
  // patchFlag: PatchFlags | undefined
  dynamicProps?: string | SimpleExpressionNode | undefined
  isBlock?: boolean
  disableTracking?: boolean
  isComponent?: boolean
}

export type PropsExpression = ObjectExpression | ExpressionNode

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
  currentNode: RootNode | TemplateChildNode
  /**
   * 收集的 helper 函数名称集合
   */
  helpers: Set<symbol>
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
  helper(name: symbol): void
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
export type NodeTransform = (node: TemplateChildNode | RootNode, context: TransformContext) => (() => void) | void

/**
 * 指令转换插件签名
 * 接受指令节点、当前元素节点和上下文
 */
export type DirectiveTransform = (
  dir: DirectiveNode,
  node: ElementNode,
  context: TransformContext
) => { props: Property[] }

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

export interface ObjectExpression extends Node {
  type: NodeTypes.JS_OBJECT_EXPRESSION
  properties: Array<Property>
}

export interface Property extends Node {
  type: NodeTypes.JS_PROPERTY
  key: ExpressionNode
  value: JSChildNode
}

/**
 * 函数调用表达式节点（简化版）
 * 代表函数调用，例如 toDisplayString(msg)
 */
export interface CallExpressionNode {
  type: 'CallExpression'
  callee: string | SimpleExpressionNode
  arguments: Array<SimpleExpressionNode | ObjectExpression | CallExpressionNode>
}

export type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode

export type JSChildNode = VNodeCall | CallExpressionNode | ObjectExpression | ExpressionNode

// export type CompilerOptions = ParserOptions & TransformOptions & CodegenOptions
export type CompilerOptions = any

/**
 * 代码生成用节点，描述如何生成渲染函数代码
 */
export type CodegenNode = VNodeCall | SimpleExpressionNode

/**
 * 属性通用类型，包含普通属性和指令
 */
export type Prop = AttributeNode | DirectiveNode
