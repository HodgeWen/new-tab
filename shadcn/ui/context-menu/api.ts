import { h, render } from 'vue'
import ContextMenu from './ContextMenu.vue'
import type {
  ContextmenuConfigWithContext,
  ContextmenuConfigWithoutContext,
  ContextmenuConfig
} from './type'

let container: HTMLElement | null = null
let destroyTimer: ReturnType<typeof setTimeout> | null = null

function ensureContainer() {
  if (destroyTimer) {
    clearTimeout(destroyTimer)
    destroyTimer = null
  }

  if (container) return container

  container = document.createElement('div')
  container.id = 'contextmenu-container'
  document.body.appendChild(container)
  return container
}

function close() {
  if (!container) return
  render(null, container)

  destroyTimer = setTimeout(() => {
    if (container) {
      document.body.removeChild(container)
      container = null
    }
    destroyTimer = null
  }, 10000)
}

export function showContextmenu(config: ContextmenuConfigWithoutContext): void
export function showContextmenu<T>(
  config: ContextmenuConfigWithContext<T>
): void
export function showContextmenu<T>(config: ContextmenuConfig<T>) {
  const el = ensureContainer()
  render(h(ContextMenu, { ...config, onClose: close }), el)
}
