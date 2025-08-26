export type InjectionKey = string | symbol

export type Provides<T = any> = Record<string | symbol, T>
