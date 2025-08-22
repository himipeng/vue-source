import { type RefImpl } from '../ref/RefImpl'

export const isObject = (val: any) => val !== null && typeof val === 'object'

export const isFunction = (val: any) => typeof val === 'function'

export const hasChanged = (value: any, oldValue: any) => !Object.is(value, oldValue)

export function isReactive(value: any): boolean {
  if (isReadonly(value)) {
    return isReactive(value['__v_raw'])
  }
  return !!(value && value['__v_isReactive'])
}

export function isReadonly(value: any) {
  return !!(value && value['__v_isReadonly'])
}

export function isShallow(value: any) {
  return !!(value && value['__v_isShallow'])
}

export function isProxy(value: any) {
  return value ? !!value['__v_raw'] : false
}

export function isRef<T>(val: any): val is RefImpl<T> {
  return !!(val && val['__v_isRef'] === true)
}

export function toRaw(observed: any): any {
  const raw = observed && observed['__v_raw']
  return raw ? toRaw(raw) : observed
}
