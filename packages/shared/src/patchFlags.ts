/**
 * PatchFlags 枚举
 * 用于标记 VNode 哪些部分是动态的，以优化更新
 */
export enum PatchFlags {
  /** 文本内容发生变化 */
  TEXT = 1, // 0000001
  /** class 属性发生变化 */
  CLASS = 1 << 1, // 0000010
  /** style 属性发生变化 */
  STYLE = 1 << 2, // 0000100
  /** 普通属性发生变化 */
  PROPS = 1 << 3, // 0001000
  /** 完整属性集合发生变化 */
  FULL_PROPS = 1 << 4, // 0010000
  /** 带 key 的 Fragment 发生变化 */
  KEYED_FRAGMENT = 1 << 5, // 0100000
  /** 需要进行补丁更新 */
  NEED_PATCH = 1 << 6, // 1000000
}
