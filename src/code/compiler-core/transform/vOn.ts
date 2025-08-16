import {
  type DirectiveTransform,
  type DirectiveNode,
  type ElementNode,
  type TransformContext,
  type Property,
  type ExpressionNode,
  NodeTypes,
} from '@/types/compiler-core/ast'
import { createCompoundExpression, createObjectProperty, createSimpleExpression } from '../ast'

/**
 * 简化版 transformOn，处理 v-on 指令转换为普通属性
 * 支持事件名转换为 onXxx 格式，表达式简单包装
 * @param dir 指令节点
 * @param node 元素节点
 * @param context 转换上下文
 * @returns 生成的属性节点数组
 */
export const transformOn: DirectiveTransform = (
  dir: DirectiveNode,
  node: ElementNode,
  context: TransformContext
): { props: Property[] } => {
  const arg = dir.arg!
  let exp: ExpressionNode | undefined = dir.exp
  // const modifiers = dir.modifiers || []

  // 事件名转驼峰并加 on 前缀，比如 click -> onClick
  let eventName = ''
  if (arg.isStatic) {
    eventName = `on${capitalize(camelize(arg.content!))}`
  } else {
    // 动态事件名，简单包裹
    eventName = `on${capitalize(camelize(arg.content!))}`
  }

  // 处理空表达式，赋默认空函数
  if (!exp || (exp.type === NodeTypes.SIMPLE_EXPRESSION && !exp.content.trim())) {
    exp = createSimpleExpression('() => {}', false)
  } else {
    // 简单包装成箭头函数表达式 (event) => handler(event)
    exp = createCompoundExpression([`$event => (`, exp, `)()`])
  }

  const prop = createObjectProperty(createSimpleExpression(eventName, true), exp)

  return {
    props: [prop],
  }
}

/** 字符串转驼峰 */
function camelize(str: string): string {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

/** 首字母大写 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
