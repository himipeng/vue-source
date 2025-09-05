import {
  type ElementNode,
  type TemplateChildNode,
  type ObjectExpression,
  type Prop,
  type Property,
  type RootNode,
  type TransformContext,
  NodeTypes,
  ElementTypes,
  type ComponentNode,
  type CompoundExpressionNode,
  type NodeTransform,
} from '../types'
import { transformBind } from './vBind'
import { transformOn } from './vOn'
import { createCallExpression, createCompoundExpression, createSimpleExpression, createVNodeCall, isText } from '../ast'
import { CREATE_TEXT, CREATE_VNODE, RESOLVE_COMPONENT, TO_DISPLAY_STRING } from '../runtimeHelpers'

/**
 * 创建 Transform 上下文
 * @param root 根节点（用于可选扩展）
 */
function createTransformContext(root: RootNode): TransformContext {
  const context: TransformContext = {
    helpers: new Set(),
    parent: null,
    nodeTransforms: [transformExpression, transformElement, transformText],
    directiveTransforms: {
      bind: transformBind,
      on: transformOn,
      // TODO: 增加更多指令转换插件，如 v-model, v-show 等
    },

    helper(name: symbol) {
      context.helpers.add(name)
      return name
    },
    currentNode: root,
  }
  return context
}

/**
 * 入口：执行 transform 阶段
 * @param root 模板 AST 根节点
 */
export function transform(root: RootNode) {
  const context = createTransformContext(root)

  // 从根节点开始递归遍历 AST
  traverseNode(root, context)

  createRootCodegen(root, context)

  // 把收集到的 helper 转成数组赋给 root
  // root.helpers = [...context.helpers]
  // root.helpers = new Set([...context.helpers.keys()])
  root.helpers = context.helpers
}

/**
 * 深度优先遍历 AST，执行各个插件的转换
 * 支持插件的先序执行和后序执行（enter/exit）
 * @param node 当前节点
 * @param context Transform 上下文
 */
function traverseNode(node: RootNode | TemplateChildNode, context: TransformContext) {
  context.currentNode = node

  // 用于存储插件返回的 exit 函数，后序执行
  const exitFns: (() => void)[] = []

  // 先序调用每个插件
  const { nodeTransforms } = context
  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context)
    if (onExit) exitFns.push(onExit)
    // 节点可能被插件移除，若已不存在则中止遍历
    if (!node) return
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      context.helper(CREATE_VNODE)
      // 深度优先遍历
      traverseChildren(node, context)
      break
  }

  context.currentNode = node

  // 后序执行插件返回的 exit 函数，顺序与先序相反
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}

export function traverseChildren(parent: RootNode | ElementNode, context: TransformContext): void {
  let i = 0
  // const nodeRemoved = () => {
  //   i--
  // }
  for (; i < parent.children.length; i++) {
    const child = parent.children[i]
    if (typeof child === 'string') continue
    // context.grandParent = context.parent
    context.parent = parent
    context.childIndex = i
    // context.onNodeRemoved = nodeRemoved
    traverseNode(child, context)
  }
}

/**
 * 表达式前缀转换插件（简化版）
 * - 给所有非静态 SimpleExpression 节点加 `_ctx.` 前缀
 * - 同时递归处理 CompoundExpressionNode
 */
export function transformExpression(node: RootNode | TemplateChildNode) {
  // 处理插值表达式
  if (node.type === NodeTypes.INTERPOLATION) {
    const content = node.content
    if (content.type === NodeTypes.SIMPLE_EXPRESSION && !content.isStatic && !isAlreadyPrefixed(content.content)) {
      content.content = prefixIdentifiers(content.content)
    }
  }
  // 处理元素节点中的指令表达式
  else if (node.type === NodeTypes.ELEMENT) {
    if (!node.props) return
    for (const prop of node.props) {
      if (prop.type === NodeTypes.DIRECTIVE) {
        // 处理指令表达式
        if (
          prop.exp &&
          prop.exp.type === NodeTypes.SIMPLE_EXPRESSION &&
          !prop.exp.isStatic &&
          !isAlreadyPrefixed(prop.exp.content)
        ) {
          prop.exp.content = prefixIdentifiers(prop.exp.content)
        }
        // 处理指令参数表达式
        if (
          prop.arg &&
          prop.arg.type === NodeTypes.SIMPLE_EXPRESSION &&
          !prop.arg.isStatic &&
          !isAlreadyPrefixed(prop.arg.content)
        ) {
          prop.arg.content = prefixIdentifiers(prop.arg.content)
        }
      }
    }
  }
  // 处理复合表达式，递归处理每个子节点
  else if (node.type === NodeTypes.COMPOUND_EXPRESSION) {
    for (const child of node.children) {
      if (typeof child === 'object') {
        transformExpression(child as any)
      }
    }
  }
}

/** 判断是否已经有 _ctx. 前缀 */
function isAlreadyPrefixed(content: string) {
  return content.startsWith('_ctx.')
}

/**
 * 插件示例：转换元素节点
 *  - 处理元素节点，后序生成 codegenNode
 *  - 收集 createElementVNode helper
 * @param node 当前 AST 节点
 * @param context Transform 上下文
 */
function transformElement(node: RootNode | TemplateChildNode, context: TransformContext) {
  if (node.type !== NodeTypes.ELEMENT) return

  // 在后序处理时生成 codegenNode：因为要等子节点（比如文本插值）都 transform 完
  return () => {
    const { tag, props } = node

    const isComponent = node.tagType === ElementTypes.COMPONENT
    let vnodeTag = isComponent ? resolveComponentType(node as ComponentNode, context) : `${tag}`

    // 结构化 props 对象表达式
    const { props: vnodeProps, patchFlag, dynamicProps } = buildProps(node, context, props || [])

    // TODO: 真实源码会计算 patchFlag、dynamicProps 传入 createVNodeCall

    // 生成 codegenNode，children 可能已经有 codegenNode
    node.codegenNode = createVNodeCall(
      vnodeTag,
      vnodeProps,
      node.children.map((child) => {
        if ('codegenNode' in child) {
          // 如果子节点已经有 codegenNode，直接使用
          return child.codegenNode
        }
        // 如果没有 codegenNode，直接返回原节点（可能是插值或其他类型）
        // 这里假设 c 已经是一个可以渲染的节点类型
        return child
      })
      // 这里简化不传 patchFlag, dynamicProps
    )
  }
}

/**
 * 解析组件tag
 * 仅支持用户组件（普通自定义组件）
 * 其他类型（动态组件 / 内置组件）暂时留空 TODO
 */
export function resolveComponentType(node: ComponentNode, context: TransformContext): string {
  const { tag } = node

  // 1. 动态组件 <component :is="...">
  // TODO: 未来支持 resolveDynamicComponent
  // if (...) return `resolveDynamicComponent(...)`

  // 2. 内置组件 <Teleport> / <KeepAlive> / <Transition>
  // TODO: 未来支持内置组件符号
  // if (...) return BuiltInComponent

  // 3. 用户组件（默认情况）合法化
  // 占位，将在运行时 resolveComponent 解析为子组件
  context.helper(RESOLVE_COMPONENT)
  return `_component_${tag.replace(/[^\w]/g, (searchValue, replaceValue) => {
    return searchValue === '-' ? '_' : tag.charCodeAt(replaceValue).toString()
  })}`
}

/**
 * 将属性数组转换成 ObjectExpression AST，并区分静态与动态属性
 * 支持调用对应的指令转换插件 transformBind、transformOn 等
 * 返回结构化的 props 和 patchFlag 信息
 * @param props 属性和指令列表
 * @param context transform 上下文
 */
function buildProps(
  node: ElementNode,
  context: TransformContext,
  props: Prop[]
): {
  props: ObjectExpression | undefined
  patchFlag?: string
  dynamicProps?: string[]
} {
  if (props.length === 0) return { props: undefined }

  // 收集属性对象的属性节点（只处理静态属性）
  // 指令本身需要复杂的逻辑（如事件修饰符、缓存等），直接放到 properties 会失去处理机会
  const properties: Property[] = []

  for (const prop of props) {
    if (prop.type === NodeTypes.ATTRIBUTE) {
      properties.push({
        type: NodeTypes.JS_PROPERTY,
        key: createSimpleExpression(prop.name, true),
        value: createSimpleExpression(prop.value!, true),
      })
    } else if (prop.type === NodeTypes.DIRECTIVE) {
      const directiveTransform = context.directiveTransforms[prop.name]
      if (directiveTransform) {
        const { props } = directiveTransform(prop, node, context)
        if (props && props.length > 0) {
          properties.push(...props)
        }
      } else {
        // 默认处理，忽略或留空
        // TODO: 支持更多指令转换逻辑
      }
    }
  }

  // TODO: 这里应根据指令转换结果动态构造 ObjectExpression，同时处理 patchFlag、dynamicProps
  // 当前简化：只返回静态属性合成的对象表达式
  return {
    props: {
      type: NodeTypes.JS_OBJECT_EXPRESSION,
      properties,
    },
  }
}

/**
 * transformText
 *
 * 该 transform 的主要职责：
 * 1. 合并相邻的文本节点（TEXT / INTERPOLATION）
 * 2. 将文本节点预转换成 `createTextVNode` 调用，避免 runtime 再做 normalize
 */
export const transformText: NodeTransform = (node, context) => {
  // 只处理这些节点，它们可能包含文本 children
  if (node.type === NodeTypes.ROOT || node.type === NodeTypes.ELEMENT) {
    // 在退出阶段处理（确保插值表达式已经 transform 完成）
    return () => {
      const children = node.children
      let currentContainer: CompoundExpressionNode | undefined = undefined

      // 1. 遍历 children，合并相邻的文本，合并成一个 COMPOUND_EXPRESSION
      // 目的：避免运行时创建多个 text vnode，节省 patch 时的对比开销
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child)) {
          // 向后查找相邻的文本节点
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if (isText(next)) {
              // 如果是第一次合并，创建一个 CompoundExpression
              if (!currentContainer) {
                currentContainer = children[i] = createCompoundExpression(
                  [child] // 初始子节点
                )
              }
              // 将下一个节点合并进来
              currentContainer.children.push(` + `, next)
              children.splice(j, 1) // 移除已合并的节点
              j--
            } else {
              currentContainer = undefined
              break
            }
          }
        }
      }

      // 2. 将 TEXT 或 COMPOUND_EXPRESSION 转换成 TEXT_CALL
      // 目的：在 codegen 阶段 能一眼识别“这是个文本 vnode”
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child) || child.type === NodeTypes.COMPOUND_EXPRESSION) {
          children[i] = {
            type: NodeTypes.TEXT_CALL,
            content: child,
            loc: child.loc,
            // 生成 codegenNode => createTextVNode(...)
            codegenNode: createCallExpression(
              context.helper(CREATE_TEXT), // runtime helper
              [child] // 参数为文本本身
            ),
          }
        }
      }
    }
  }
}

/**
 * 工具：给表达式添加 _ctx. 前缀（极简）
 */
function prefixIdentifiers(content: string): string {
  // TODO: 这里极简示例，真实源码有复杂语法分析和作用域判断
  return `_ctx.${content}`
}

function createRootCodegen(root: RootNode, context: TransformContext) {
  const { children } = root

  if (children.length === 1) {
    const child = children[0]
    // 如果唯一的子节点是 ElementNode / VNodeCall
    if (child.type === NodeTypes.ELEMENT && child.codegenNode) {
      root.codegenNode = child.codegenNode
    }
    //  else {
    //   // Fragment 情况
    //   root.codegenNode = createVNodeCall(
    //     context,
    //     context.helper(FRAGMENT),
    //     undefined, // props
    //     children
    //   )
    // }
  }
  // else if (children.length > 1) {
  //   // 多根节点一定会生成 Fragment
  //   root.codegenNode = createVNodeCall(context, context.helper(FRAGMENT), undefined, children)
  // }
}
