import { GridStack, type GridStackWidget } from 'gridstack'
import { onMounted, useTemplateRef, render, type VNode } from 'vue'

import type { ItemType } from '@/types/common'
import type { FolderItemUI, GridItemUI, SiteItemUI } from '@/types/ui'

import { NFolderItem } from '@/components/folder-item'
import { NSiteItem } from '@/components/site-item'

const renderMap: Record<ItemType, (item: GridItemUI) => VNode> = {
  site: (item) => {
    return <NSiteItem item={item as SiteItemUI} />
  },
  folder: (item) => {
    return <NFolderItem item={item as FolderItemUI} />
  }
}

export function useGridStack(ref: string) {
  let gridStack: GridStack | null = null

  const gridContainer = useTemplateRef<HTMLElement>(ref)

  const shadowDom: Record<string, HTMLElement> = {}
  GridStack.renderCB = (el: HTMLElement, widget: GridStackWidget) => {
    const item = gridItemStore.itemsMap.get(widget.id!)

    if (!item) return

    const createVNode = renderMap[item.type]

    const vnode = createVNode(item)
    if (vnode) {
      shadowDom[item.id] = el
      render(vnode, el)
    }
  }

  onMounted(() => {
    if (!gridContainer.value) return
    gridStack = GridStack.init(
      {
        cellHeight: 92,
        margin: 8,
        float: false,
        animate: false,
        disableResize: true,
        acceptWidgets: false,
        staticGrid: false,
        columnOpts: { columnWidth: 88, columnMax: 12, layout: 'compact' }
      },
      gridContainer.value
    )
  })
}
