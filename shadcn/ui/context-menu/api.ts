import { createVNode, render, type Component } from 'vue'
import ContextMenuRenderer from './context-menu-renderer.vue'
import { useContextMenu, type ContextMenuActionItem } from './use-context-menu'

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

let rendererContainer: HTMLElement | null = null
let rendererMounted = false

function ensureRendererMounted() {
  if (typeof document === 'undefined') return

  if (rendererContainer && !rendererContainer.isConnected) {
    rendererContainer = null
    rendererMounted = false
  }

  if (!rendererContainer) {
    rendererContainer = document.createElement('div')
    rendererContainer.dataset.contextmenuRoot = 'true'
    document.body.appendChild(rendererContainer)
  }

  if (!rendererMounted) {
    render(createVNode(ContextMenuRenderer), rendererContainer)
    rendererMounted = true
  }
}

const contextMenuStore = useContextMenu()

export const contextmenu = {
  /**
   * 显示 ContextMenu。首次调用会自动挂载渲染器。
   */
  show<T extends Record<string, unknown>>(config: ContextmenuConfig<T>) {
    ensureRendererMounted()

    const items: ContextMenuActionItem[] = config.items.map(item => {
      const action = () => {
        const handler = item.action as (context?: T) => void
        if (typeof config.context === 'undefined') {
          handler()
          return
        }
        handler(config.context)
      }

      return {
        icon: item.icon,
        label: item.label,
        action
      }
    })

    contextMenuStore.show({ x: config.x, y: config.y, items })
  }
}
