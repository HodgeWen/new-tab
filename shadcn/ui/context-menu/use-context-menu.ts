import { shallowRef } from 'vue'
import type { Component } from 'vue'

export interface ContextMenuActionItem {
  icon?: Component
  label: string
  action: () => void
  danger?: boolean
  disabled?: boolean
}

export interface ContextMenuDivider {
  type: 'divider'
}

export interface ContextMenuSubmenu {
  type: 'submenu'
  icon?: Component
  label: string
  items: ContextMenuActionItem[]
}

export type ContextMenuItemConfig =
  | ContextMenuActionItem
  | ContextMenuDivider
  | ContextMenuSubmenu

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  items: ContextMenuItemConfig[]
}

const state = shallowRef<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
  items: []
})

export function useContextMenu() {
  function show(payload: Omit<ContextMenuState, 'visible'>) {
    state.value = {
      ...payload,
      visible: true
    }
  }

  function hide() {
    state.value = {
      ...state.value,
      visible: false
    }
  }

  return {
    state,
    show,
    hide
  }
}
