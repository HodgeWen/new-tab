import type { Component } from 'vue'

export interface ContextmenuItem<A = undefined> {
  icon?: Component
  label: string
  action?: A extends undefined ? () => void : (context: A) => void
  children?: ContextmenuItem<A>[]
}

export type ContextmenuConfigWithContext<T> = {
  x: number
  y: number
  context: T
  items: ContextmenuItem<T>[]
}

export type ContextmenuConfigWithoutContext = {
  x: number
  y: number
  items: ContextmenuItem[]
}

export type ContextmenuConfig<T = undefined> =
  | ContextmenuConfigWithoutContext
  | ContextmenuConfigWithContext<T>
