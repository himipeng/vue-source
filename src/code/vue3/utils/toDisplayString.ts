import { isObject } from '.'

export function toDisplayString(val: unknown): string {
  return val == null
    ? ''
    : isObject(val)
    ? JSON.stringify(val, null, 2) // 对象 => 格式化的 JSON
    : String(val) // 其他类型直接转字符串
}
