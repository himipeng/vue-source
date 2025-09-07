/**
 * Vue3 模板编译器通用类型定义
 * 包含模板解析（Parse）和转换（Transform）阶段常用的 AST 类型与上下文类型。
 */

/**
 * 根节点接口，代表整个模板的根节点。
 * @interface RootNode
 * @extends {Node}
 */
export interface RootNode extends Node {
  /** 节点类型，固定为 ROOT */
  type: NodeTypes.ROOT
  /** 源模板字符串 */
  source: string
  /** 根节点的子节点数组 */
  children: TemplateChildNode[]
  /** 编译过程中使用的辅助函数集合 */
  helpers: Set<symbol>
  /** 模板中使用的组件名称集合 */
  components: string[]
  /** 模板中使用的指令名称集合 */
  directives: string[]
  /** 静态提升的节点或表达式数组 */
  hoists: (JSChildNode | null)[]
  /** 代码生成节点，描述如何生成渲染函数 */
  codegenNode?: CodegenNode
}

/**
 * 所有模板子节点的联合类型，涵盖元素、文本、表达式等多种节点类型。
 */
export type TemplateChildNode = ElementNode | InterpolationNode | CompoundExpressionNode | TextNode | TextCallNode

/**
 * 基础节点接口，所有 AST 节点均继承自此接口。
 * @interface Node
 */
export interface Node {
  /** 节点类型 */
  type: NodeTypes
  /** 源码位置信息 */
  loc?: SourceLocation
}

/**
 * 节点类型枚举，定义了所有可能的 AST 节点类型。
 * @enum {string}
 */
export enum NodeTypes {
  /** 根节点 */
  ROOT = 'ROOT',
  /** 元素节点 */
  ELEMENT = 'ELEMENT',
  /** 文本节点 */
  TEXT = 'TEXT',
  /** 简单表达式节点 */
  SIMPLE_EXPRESSION = 'SIMPLE_EXPRESSION',
  /** 插值节点 */
  INTERPOLATION = 'INTERPOLATION',
  /** 属性节点 */
  ATTRIBUTE = 'ATTRIBUTE',
  /** 指令节点 */
  DIRECTIVE = 'DIRECTIVE',
  /** 复合表达式节点 */
  COMPOUND_EXPRESSION = 'COMPOUND_EXPRESSION',
  /** 虚拟节点调用 */
  VNODE_CALL = 'VNODE_CALL',
  /** JS 对象表达式 */
  JS_OBJECT_EXPRESSION = 'JS_OBJECT_EXPRESSION',
  /** JS 属性 */
  JS_PROPERTY = 'JS_PROPERTY',
  /** 文本调用节点 */
  TEXT_CALL = 'TEXT_CALL',
  /** JS 函数调用表达式 */
  JS_CALL_EXPRESSION = 'JS_CALL_EXPRESSION',
}

/**
 * 元素类型枚举，区分不同类型的元素节点。
 * @enum {number}
 */
export enum ElementTypes {
  /** 普通元素 */
  ELEMENT,
  /** 组件 */
  COMPONENT,
  /** 插槽 */
  SLOT,
  /** 模板容器 */
  TEMPLATE,
}

/**
 * 元素节点联合类型，包含普通元素、组件、插槽和模板节点。
 */
export type ElementNode = PlainElementNode | ComponentNode | SlotOutletNode | TemplateNode

/**
 * 基础元素节点接口，所有元素节点的基类。
 * @interface BaseElementNode
 * @extends {Node}
 */
export interface BaseElementNode extends Node {
  /** 节点类型，固定为 ELEMENT */
  type: NodeTypes.ELEMENT
  /** 标签名称 */
  tag: string
  /** 元素类型，区分普通元素、组件等 */
  tagType: ElementTypes
  /** 属性和指令数组 */
  props?: Array<AttributeNode | DirectiveNode>
  /** 子节点数组 */
  children: TemplateChildNode[]
  /** 是否自闭合 */
  isSelfClosing?: boolean
}

/**
 * 普通元素节点接口。
 * @interface PlainElementNode
 * @extends {BaseElementNode}
 */
export interface PlainElementNode extends BaseElementNode {
  /** 元素类型，固定为 ELEMENT */
  tagType: ElementTypes.ELEMENT
  /** 代码生成节点，可以是虚拟节点调用或提升的简单表达式 */
  codegenNode?:
    | VNodeCall
    | SimpleExpressionNode // 当节点被提升时为简单表达式
    | undefined
}

/**
 * 组件节点接口。
 * @interface ComponentNode
 * @extends {BaseElementNode}
 */
export interface ComponentNode extends BaseElementNode {
  /** 元素类型，固定为 COMPONENT */
  tagType: ElementTypes.COMPONENT
  /** 代码生成节点，虚拟节点调用 */
  codegenNode?: VNodeCall | undefined
}

/**
 * 插槽节点接口。
 * @interface SlotOutletNode
 * @extends {BaseElementNode}
 */
export interface SlotOutletNode extends BaseElementNode {
  /** 元素类型，固定为 SLOT */
  tagType: ElementTypes.SLOT
  /** 插槽节点没有代码生成节点 */
  codegenNode?: undefined
}

/**
 * 模板容器节点接口。
 * @interface TemplateNode
 * @extends {BaseElementNode}
 */
export interface TemplateNode extends BaseElementNode {
  /** 元素类型，固定为 TEMPLATE */
  tagType: ElementTypes.TEMPLATE
  /** 模板容器节点总是被编译移除，无代码生成节点 */
  codegenNode?: undefined
}

/**
 * 文本节点接口，表示纯文本内容。
 * @interface TextNode
 * @extends {Node}
 */
export interface TextNode extends Node {
  /** 节点类型，固定为 TEXT */
  type: NodeTypes.TEXT
  /** 文本内容 */
  content: string
}

/**
 * 属性节点接口，表示普通属性。
 * @interface AttributeNode
 * @extends {Node}
 */
export interface AttributeNode extends Node {
  /** 节点类型，固定为 ATTRIBUTE */
  type: NodeTypes.ATTRIBUTE
  /** 属性名称 */
  name: string
  /** 属性值，字符串或未定义 */
  value: string | undefined
}

/**
 * 指令节点接口，表示模板中的指令。
 * @interface DirectiveNode
 * @extends {Node}
 */
export interface DirectiveNode extends Node {
  /** 节点类型，固定为 DIRECTIVE */
  type: NodeTypes.DIRECTIVE
  /** 指令名称 */
  name: string
  /** 原始指令名称 */
  rawName?: string
  /** 指令表达式 */
  exp: ExpressionNode | undefined
  /** 指令参数 */
  arg: ExpressionNode | undefined
  /** 指令修饰符数组 */
  modifiers: SimpleExpressionNode[]
}

/**
 * 简单表达式节点接口，表示基础表达式。
 * @interface SimpleExpressionNode
 * @extends {Node}
 */
export interface SimpleExpressionNode extends Node {
  /** 节点类型，固定为 SIMPLE_EXPRESSION */
  type: NodeTypes.SIMPLE_EXPRESSION
  /** 表达式内容字符串 */
  content: string
  /** 是否为静态表达式 */
  isStatic: boolean
  /** 提升的 JS 子节点 */
  hoisted?: JSChildNode
  /** 标识符列表 */
  identifiers?: string[]
  /** 是否为事件处理函数键 */
  isHandlerKey?: boolean
}

/**
 * 插值节点接口，表示模板中的插值表达式。
 * @interface InterpolationNode
 * @extends {Node}
 */
export interface InterpolationNode extends Node {
  /** 节点类型，固定为 INTERPOLATION */
  type: NodeTypes.INTERPOLATION
  /** 插值表达式内容 */
  content: ExpressionNode
}

/**
 * 复合表达式节点接口，包含多个表达式和文本的组合。
 * @interface CompoundExpressionNode
 * @extends {Node}
 */
export interface CompoundExpressionNode extends Node {
  /** 节点类型，固定为 COMPOUND_EXPRESSION */
  type: NodeTypes.COMPOUND_EXPRESSION
  /** 子节点数组，包含表达式、文本、字符串和符号 */
  children: (SimpleExpressionNode | CompoundExpressionNode | InterpolationNode | TextNode | string | symbol)[]
  /** 标识符列表 */
  identifiers?: string[]
  /** 是否为事件处理函数键 */
  isHandlerKey?: boolean
  /** 是否为静态表达式 */
  isStatic?: boolean
  /** 表达式内容字符串 */
  content?: string
}

/**
 * 虚拟节点调用接口，描述如何生成虚拟 DOM 节点。
 * @interface VNodeCall
 * @extends {Node}
 */
export interface VNodeCall extends Node {
  /** 节点类型，固定为 VNODE_CALL */
  type: NodeTypes.VNODE_CALL
  /** 标签名称或组件名 */
  tag: string
  /** 属性表达式 */
  props: PropsExpression | undefined
  /** 子节点，可以是多个模板子节点或提升的简单表达式 */
  children:
    | TemplateChildNode[] // 多个子节点
    | SimpleExpressionNode // 提升的子节点
    | undefined
  /** 动态属性 */
  dynamicProps?: string | SimpleExpressionNode | undefined
  /** 是否为块级节点 */
  isBlock?: boolean
  /** 是否禁用跟踪 */
  disableTracking?: boolean
  /** 是否为组件节点 */
  isComponent?: boolean
}

/**
 * 文本调用节点接口，表示文本节点的调用。
 * @interface TextCallNode
 * @extends {Node}
 */
export interface TextCallNode extends Node {
  /** 节点类型，固定为 TEXT_CALL */
  type: NodeTypes.TEXT_CALL
  /** 文本内容，可以是文本节点、插值节点或复合表达式 */
  content: TextNode | InterpolationNode | CompoundExpressionNode
  /** 代码生成节点，提升时为调用表达式或简单表达式 */
  codegenNode: CallExpression | SimpleExpressionNode
}

/**
 * 函数调用表达式接口，表示一个函数调用。
 * @interface CallExpression
 * @extends {Node}
 */
export interface CallExpression extends Node {
  /** 节点类型，固定为 JS_CALL_EXPRESSION */
  type: NodeTypes.JS_CALL_EXPRESSION
  /** 函数名或符号 */
  callee: string | symbol
  /** 函数调用参数列表 */
  arguments: (string | symbol | JSChildNode | TemplateChildNode | TemplateChildNode[])[]
}

/**
 * 属性表达式类型，可能是对象表达式或任意表达式节点。
 */
export type PropsExpression = ObjectExpression | ExpressionNode

/**
 * 解析阶段上下文接口，保存剩余模板字符串。
 * @interface ParserContext
 */
export interface ParserContext {
  /** 当前剩余的模板字符串 */
  source: string
}

/**
 * 转换阶段上下文接口，保存当前节点、父节点、辅助函数集合等信息。
 * @interface TransformContext
 */
export interface TransformContext {
  /** 当前处理的节点 */
  currentNode: RootNode | TemplateChildNode
  /** 收集的辅助函数名称集合 */
  helpers: Set<symbol>
  /** 当前节点的父节点 */
  parent: RootNode | ElementNode | null
  /** 当前遍历子节点的索引（可选） */
  childIndex?: number
  /**
   * 注册辅助函数名称
   * @param {symbol} name - helper 名称
   * @returns {symbol} 注册后的 helper 名称
   */
  helper(name: symbol): symbol
  /** 节点转换插件列表 */
  nodeTransforms: NodeTransform[]
  /** 指令转换插件集合，键为指令名称 */
  directiveTransforms: Record<string, DirectiveTransform>
}

/**
 * 节点转换插件函数签名。
 * 接受当前节点和上下文，支持返回后序钩子。
 * @callback NodeTransform
 * @param {TemplateChildNode|RootNode} node - 当前处理的节点
 * @param {TransformContext} context - 转换上下文
 * @returns {(() => void) | void} 可选的后序钩子函数
 */
export type NodeTransform = (node: TemplateChildNode | RootNode, context: TransformContext) => (() => void) | void

/**
 * 指令转换插件函数签名。
 * 接受指令节点、当前元素节点和上下文，返回转换后的属性。
 * @callback DirectiveTransform
 * @param {DirectiveNode} dir - 指令节点
 * @param {ElementNode} node - 当前元素节点
 * @param {TransformContext} context - 转换上下文
 * @returns {{ props: Property[] }} 转换后的属性数组
 */
export type DirectiveTransform = (
  dir: DirectiveNode,
  node: ElementNode,
  context: TransformContext
) => { props: Property[] }

/**
 * 源码位置信息接口，描述源码片段的起止位置。
 * @interface SourceLocation
 */
export interface SourceLocation {
  /** 源码字符串 */
  source: string
  /** 起始位置 */
  start: Position
  /** 结束位置 */
  end: Position
}

/**
 * 位置点接口，包含行、列和偏移量。
 * @interface Position
 */
export interface Position {
  /** 行号，从 1 开始 */
  line: number
  /** 列号，从 1 开始 */
  column: number
  /** 偏移量，从 0 开始 */
  offset: number
}

/**
 * JS 对象表达式节点接口。
 * @interface ObjectExpression
 * @extends {Node}
 */
export interface ObjectExpression extends Node {
  /** 节点类型，固定为 JS_OBJECT_EXPRESSION */
  type: NodeTypes.JS_OBJECT_EXPRESSION
  /** 属性数组 */
  properties: Array<Property>
}

/**
 * JS 属性节点接口，表示对象属性。
 * @interface Property
 * @extends {Node}
 */
export interface Property extends Node {
  /** 节点类型，固定为 JS_PROPERTY */
  type: NodeTypes.JS_PROPERTY
  /** 属性键，表达式节点 */
  key: ExpressionNode
  /** 属性值，JS 子节点 */
  value: JSChildNode
}

/**
 * 表达式节点类型，包含简单表达式和复合表达式。
 */
export type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode

/**
 * JS 子节点类型，包含虚拟节点调用、函数调用表达式、对象表达式和表达式节点。
 */
export type JSChildNode = VNodeCall | CallExpression | ObjectExpression | ExpressionNode

// export type CompilerOptions = ParserOptions & TransformOptions & CodegenOptions

/**
 * 编译器选项类型，暂时定义为任意类型。
 */
// TODO: export type CompilerOptions = ParserOptions & TransformOptions & CodegenOptions
export type CompilerOptions = { mode?: 'function' | 'module'; runtimeModuleName?: string } & Record<string, any>

/**
 * 代码生成节点类型，描述如何生成渲染函数代码。
 */
export type CodegenNode = TemplateChildNode | JSChildNode

/**
 * 属性通用类型，包含普通属性和指令。
 */
export type Prop = AttributeNode | DirectiveNode
