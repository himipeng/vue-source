import { isObject } from '@vue/utils'

/**
 * 将任意值转换为字符串，用于插值显示
 * @param value 需要显示的值，可以是 string | number | boolean | null | undefined | object
 * @returns 转换后的字符串，null 或 undefined 返回空字符串
 *
 * 示例：
 * toDisplayString(123) -> "123"
 * toDisplayString(null) -> ""
 * toDisplayString({ a: 1 }) -> "[object Object]"
 */
export function toDisplayString(value: unknown): string {
  if (value == null) {
    // null 或 undefined 返回空字符串
    return ''
  } else if (isObject(value)) {
    // 对象类型默认调用 toString，避免 [object Object] 直接显示
    return JSON.stringify(value)
  } else {
    // 其他基本类型直接转换为字符串
    return String(value)
  }
}
