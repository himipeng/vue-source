import { isObject } from '@purevue/shared'

// 用于缓存已访问的对象，避免循环引用导致的无限递归
const seenObjects = new Set()

/** 用于递归地访问对象的所有嵌套属性 */
export function traverse(value: any) {
  const res = _traverse(value, seenObjects)
  seenObjects.clear() // 遍历完成后清空缓存
  return res
}

function _traverse(value: any, seen: Set<any>) {
  // 不是对象或是 null，直接返回
  if (!isObject(value)) return value

  // 如果已经访问过，直接返回，避免循环引用
  if (seen.has(value)) return value
  seen.add(value)

  if (Array.isArray(value)) {
    // 如果是数组，递归访问每一项
    for (let i = 0; i < value.length; i++) {
      _traverse(value[i], seen)
    }
  } else {
    // 如果是对象，递归访问每个键的值
    for (const key in value) {
      _traverse(value[key], seen)
    }
  }
  return value
}
