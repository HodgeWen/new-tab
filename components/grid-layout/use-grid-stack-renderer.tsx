import { GridStack, type GridStackNode, type GridStackWidget } from 'gridstack'
import { render, type VNode } from 'vue'

import type { GridItemUI } from '@/types/ui'

interface GridStackRendererOptions {
  getGridItem: (id: string) => GridItemUI | undefined
  renderWidget: (item: GridItemUI) => VNode
}

export interface GridStackRenderer {
  findWidgetEl: (id: string) => HTMLElement | undefined
  renderWidgetById: (id: string) => void
  cleanupRemoved: (nodes: GridStackNode[]) => void
  cleanupAll: () => void
  installRenderCallback: () => void
  restoreRenderCallback: () => void
}

export function createGridStackRenderer(options: GridStackRendererOptions): GridStackRenderer {
  const shadowDom = new Map<string, HTMLElement>()
  let previousRenderCallback = GridStack.renderCB

  function renderWidgetById(id: string) {
    const el = shadowDom.get(id)
    if (!el) return
    const item = options.getGridItem(id)
    if (!item) return
    render(options.renderWidget(item), el)
  }

  function cleanupRemoved(nodes: GridStackNode[]) {
    nodes.forEach((node) => {
      const id = node.id
      if (!id) return
      const el = shadowDom.get(id)
      if (!el) return
      render(null, el)
      shadowDom.delete(id)
    })
  }

  function cleanupAll() {
    shadowDom.forEach((el) => render(null, el))
    shadowDom.clear()
  }

  function installRenderCallback() {
    previousRenderCallback = GridStack.renderCB
    GridStack.renderCB = (el: HTMLElement, widget: GridStackWidget) => {
      const id = widget.id
      if (!id) return
      const item = options.getGridItem(id)
      if (!item) return
      shadowDom.set(id, el)
      render(options.renderWidget(item), el)
    }
  }

  function restoreRenderCallback() {
    GridStack.renderCB = previousRenderCallback
  }

  return {
    findWidgetEl: (id) => shadowDom.get(id),
    renderWidgetById,
    cleanupRemoved,
    cleanupAll,
    installRenderCallback,
    restoreRenderCallback
  }
}
