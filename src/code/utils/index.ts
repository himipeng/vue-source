/**
 * 将连字符分隔的字符串转换为驼峰格式
 *
 * @example
 * camelize('hello-world') // 'helloWorld'
 */
export function camelize(str: string): string {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

/**
 * 将字符串首字母大写
 *
 * @example
 * capitalize('hello') // 'Hello'
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 判断是否为字符串类型
 */
export const isString = (val: unknown): val is string =>
  typeof val === 'string'

/**
 * 判断是否为 Symbol 类型
 */
export const isSymbol = (val: unknown): val is symbol =>
  typeof val === 'symbol'

/**
 * 判断是否为数组
 * 使用原生 Array.isArray
 */
export const isArray: typeof Array.isArray = Array.isArray

/**
 * 判断是否为对象（不包括 null）
 */
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

/**
 * 判断是否为函数
 */
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

/**
 * Object.prototype.toString 的别名
 * - 可用于获取精确的类型标签
 */
export const objectToString: typeof Object.prototype.toString =
  Object.prototype.toString

/**
 * 判断一个 key 是否为合法的数组索引（整数字符串）
 *
 * 条件：
 * - 必须是字符串
 * - 不能为 "NaN"
 * - 不能以 "-" 开头（负数）
 * - parseInt(key) 转换回字符串必须等于原 key
 */
export const isIntegerKey = (key: unknown): boolean =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key

/** Object.prototype.hasOwnProperty 的别名 */
const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * 判断对象是否具有指定属性（不查找原型链）
 */
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)