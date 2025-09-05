import type { DirectiveTransform, DirectiveNode, ElementNode, TransformContext, Property } from '../types'
import { createObjectProperty, createSimpleExpression } from '../ast'

// 简化版 transformBind，只保留核心功能：将 v-bind 转成属性键值对
export const transformBind: DirectiveTransform = (
  dir: DirectiveNode,
  node: ElementNode,
  context: TransformContext
): { props: Property[] } => {
  const arg = dir.arg!
  let exp = dir.exp
  // const modifiers = dir.modifiers || []

  // 如果没有表达式，尝试做同名简写，如 :foo 转成 :foo="foo"
  if (!exp) {
    // 这里简单处理为同名字符串表达式
    if (arg.isStatic) {
      exp = createSimpleExpression(arg.content!, false)
    } else {
      exp = createSimpleExpression('', true)
    }
  }

  // 处理 .camel 修饰符，转驼峰名
  // if (modifiers.some((mod) => mod.content === 'camel')) {
  //   if (arg.isStatic) {
  //     arg.content = camelize(arg.content)
  //   } else {
  //     arg.content = `${context.helper('camelize')}(${arg.content})`
  //   }
  // }

  // 处理动态参数，确保安全访问
  if (!arg.isStatic) {
    arg.content = arg.content ? `(${arg.content}) || ""` : `""`
  }

  // 生成属性节点
  const prop = createObjectProperty(arg, exp)

  // 直接把转换结果放到元素节点 props 里（你也可以选择由调用方合并）
  // node.props ||= []
  // node.props.push({
  //   type: 'Attribute',
  //   name: arg.content,
  //   value: exp.content,
  // })

  return {
    props: [prop],
  }
}
