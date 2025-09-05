/**
 * Vue 内部用于标记响应式对象的特殊属性 key。
 */
export enum ReactiveFlags {
  /**
   * 跳过响应式转换标志。
   *
   * - 当对象上存在 `__v_skip: true` 时，
   *   `reactive()` 不会再对该对象进行代理包装。
   * - 典型场景：一些已经被处理过的对象，避免重复代理。
   */
  SKIP = '__v_skip',

  /**
   * 是否为响应式对象。
   *
   * - 由 `reactive()` 包装过的对象上会自动带有该属性。
   * - 常用于 Vue 内部做类型识别。
   */
  IS_REACTIVE = '__v_isReactive',

  /**
   * 是否为只读对象。
   *
   * - 由 `readonly()` 包装过的对象上会自动带有该属性。
   * - 修改只读对象会触发警告。
   */
  IS_READONLY = '__v_isReadonly',

  /**
   * 是否为浅层响应式对象。
   *
   * - 由 `shallowReactive()` 或 `shallowReadonly()` 创建。
   * - 只代理第一层属性，嵌套对象不会被递归转换。
   */
  IS_SHALLOW = '__v_isShallow',

  /**
   * 获取原始对象。
   *
   * - 通过 `toRaw(obj)` 实现：返回代理背后的原始对象。
   * - 内部依赖 `__v_raw` 属性来识别。
   */
  RAW = '__v_raw',

  /**
   * 是否为 Ref 对象。
   *
   * - 由 `ref()` 或 `shallowRef()` 创建。
   * - Ref 对象内部有 `.value` 属性，访问时会触发依赖收集。
   */
  IS_REF = '__v_isRef',
}
