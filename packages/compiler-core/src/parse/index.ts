import {
  type ElementNode,
  type InterpolationNode,
  type TemplateChildNode,
  type Prop,
  type TextNode,
  type DirectiveNode,
  type RootNode,
  NodeTypes,
} from '../types'
import { createElementNode, createInterpolation, createSimpleExpression, createTextNode } from '../ast'

/**
 * 解析上下文，用于保存剩余待解析的模板字符串
 */
interface ParserContext {
  source: string
}

/**
 * 模板解析入口函数
 * @param input 模板字符串，例如 "<div>{{ msg }}</div>"
 * @returns 根节点 AST
 */
export function baseParse(input: string): RootNode {
  const root = createRoot([], input)
  const context = createParserContext(input)
  root.children = parseChildren(context).children
  return root
}

function createRoot(children: TemplateChildNode[], source = ''): RootNode {
  return {
    type: NodeTypes.ROOT,
    source,
    children,
    helpers: new Set(),
    components: [],
    directives: [],
    hoists: [],
    codegenNode: undefined,
    loc: undefined,
  }
}

/**
 * 创建解析上下文
 * @param template 模板字符串
 * @returns 解析上下文对象
 */
function createParserContext(template: string): ParserContext {
  return { source: template }
}

/**
 * 解析子节点（可以是文本、插值、元素）
 * @param context 解析上下文
 * @param parentTag 可选，当前父标签名（用于检测对应的结束标签并停止解析）
 * @returns Element 节点，tag 为 parentTag 或 'root'
 */
function parseChildren(context: ParserContext, parentTag?: string): ElementNode {
  const nodes: TemplateChildNode[] = []

  // 循环解析直到遇到结束条件
  while (!isEnd(context)) {
    if (context.source.startsWith('{{')) {
      nodes.push(parseInterpolation(context))
      continue
    }

    if (context.source.startsWith('</')) {
      const endMatch = /^<\/([a-zA-Z][\w-]*)\s*>/.exec(context.source)
      if (endMatch) {
        const endTagName = endMatch[1]
        if (!parentTag) {
          throw new Error(`缺少开始标签，遇到结束标签: </${endTagName}>`)
        }
        if (endTagName !== parentTag) {
          throw new Error(`结束标签不匹配：遇到 </${endTagName}>，期待 </${parentTag}>`)
        }
        break
      } else {
        throw new Error('结束标签格式错误')
      }
    }

    if (context.source.startsWith('<')) {
      nodes.push(parseElement(context))
      continue
    }

    const textNode = parseText(context)
    if (textNode !== null) {
      nodes.push(textNode)
    }
  }

  const tag = parentTag || 'root'

  return createElementNode(tag, undefined, nodes)
}

/**
 * 判断是否解析结束
 * @param context 解析上下文
 */
function isEnd(context: ParserContext): boolean {
  return !context.source
}

/**
 * 解析插值节点 {{ expression }}
 * @param context 解析上下文
 */
function parseInterpolation(context: ParserContext): InterpolationNode {
  const closeIndex = context.source.indexOf('}}', 2)
  if (closeIndex === -1) throw new Error('插值缺少结束符 }}')

  const rawContent = context.source.slice(2, closeIndex).trim()

  advanceBy(context, closeIndex + 2)

  return createInterpolation(rawContent)
}

/**
 * 解析元素节点 <tag ...> ... </tag>
 * 支持标签名含大小写、数字、下划线、连接符
 * 支持开始标签中包含属性，区分普通属性和指令
 * @param context 解析上下文
 */
function parseElement(context: ParserContext): ElementNode {
  const startTagMatch = /^<([a-zA-Z][\w-]*)\b([^>]*)>/.exec(context.source)
  if (!startTagMatch) throw new Error('开始标签格式错误')

  const tag = startTagMatch[1]
  const attrString = startTagMatch[2] || ''
  const props = parseAttributes(attrString)

  advanceBy(context, startTagMatch[0].length)

  const children = parseChildren(context, tag).children

  const endTagMatch = new RegExp(`^</${tag}\\s*>`).exec(context.source)
  if (!endTagMatch) throw new Error(`缺少结束标签: </${tag}>`)
  advanceBy(context, endTagMatch[0].length)

  return createElementNode(tag, props, children)
}

/**
 * 解析属性字符串为属性数组，区分指令和普通属性
 * @param attrString 属性字符串，如 ' id="foo" disabled @click="foo" :title="bar" v-if="ok"'
 * @returns 属性对象数组
 */
function parseAttributes(attrString: string): Prop[] {
  const props: Prop[] = []
  const attrRE = /([^\s=]+)(?:="([^"]*)")?/g
  let match: RegExpExecArray | null
  while ((match = attrRE.exec(attrString))) {
    const rawName = match[1]
    const value = match[2] !== undefined ? match[2] : ''

    if (rawName.startsWith('v-')) {
      const dirMatch = /^v-([a-zA-Z0-9\-]+)(?::([^\s]+))?/.exec(rawName)
      if (dirMatch) {
        const name = dirMatch[1]
        const argStr = dirMatch[2]

        const dirNode: DirectiveNode = {
          type: NodeTypes.DIRECTIVE,
          name,
          // exp为空时，会保留空字符串，不会改为 true（没必要）
          // 因为 html 会将空属性视为 true
          exp: value ? createSimpleExpression(value, false) : undefined,
          arg: argStr ? createSimpleExpression(argStr, true) : undefined,
          modifiers: [],
        }
        props.push(dirNode)
        continue
      }
    } else if (rawName.startsWith('@')) {
      const eventName = rawName.slice(1)
      const dirNode: DirectiveNode = {
        type: NodeTypes.DIRECTIVE,
        name: 'on',
        exp: value ? createSimpleExpression(value, false) : undefined,
        arg: createSimpleExpression(eventName, true),
        modifiers: [],
      }
      props.push(dirNode)
      continue
    } else if (rawName.startsWith(':')) {
      const bindName = rawName.slice(1)
      const dirNode: DirectiveNode = {
        type: NodeTypes.DIRECTIVE,
        name: 'bind',
        exp: value ? createSimpleExpression(value, false) : undefined,
        arg: createSimpleExpression(bindName, true),
        modifiers: [],
      }
      props.push(dirNode)
      continue
    }

    props.push({
      type: NodeTypes.ATTRIBUTE,
      name: rawName,
      value,
    })
  }
  return props
}

/**
 * 解析文本节点
 * @param context 解析上下文
 */
function parseText(context: ParserContext): TextNode | null {
  let endIndex = context.source.length
  const ltIndex = context.source.indexOf('<')
  const delimiterIndex = context.source.indexOf('{{')

  if (ltIndex !== -1 && ltIndex < endIndex) endIndex = ltIndex
  if (delimiterIndex !== -1 && delimiterIndex < endIndex) endIndex = delimiterIndex

  const content = context.source.slice(0, endIndex)
  advanceBy(context, endIndex)

  if (content.trim() === '') {
    return null
  }

  return createTextNode(content)
}

/**
 * 向前推进解析位置
 * @param context 解析上下文
 * @param n 前进的字符数
 */
function advanceBy(context: ParserContext, n: number) {
  context.source = context.source.slice(n)
}
