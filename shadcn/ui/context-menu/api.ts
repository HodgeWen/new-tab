import { render, type Component } from 'vue'

export interface ContextmenuItem<T> {
  icon?: Component
  label: string
  action: T extends undefined ? () => void : (context: T) => void
}

export type ContextmenuConfig<T> = {
  x: number
  y: number
  context?: T
  items: ContextmenuItem<T extends Record<string, unknown> ? T : undefined>[]
}

export const contextmenu = {
  show<T extends Record<string, unknown>>(config: ContextmenuConfig<T>) {
    // 使用 render() 渲染菜单
  }
}
