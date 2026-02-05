import { GridStack, type GridStackWidget } from 'gridstack'
import { nanoid } from 'nanoid'
import { onMounted, useTemplateRef, render, type VNode } from 'vue'

import type { ItemType } from '@/types/common'
import type { FolderItemForm, FolderItemUI, GridItemUI, SiteItemForm, SiteItemUI } from '@/types/ui'

import { NFolderItem } from '@/components/folder-item'
import { NSiteItem } from '@/components/site-item'
import { addGridItem, gridItemsMap } from '@/store/grid-items'

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
    const item = gridItemsMap.get(widget.id!)

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

  function addWidget(item: SiteItemForm | FolderItemForm) {
    if (!gridStack) return
    const id = nanoid(10)
    const el = gridStack.addWidget({ id, content: item.title })
    const x = +(el.getAttribute('gs-x') ?? 0)
    const y = +(el.getAttribute('gs-y') ?? 0)

    addGridItem({ ...item, id, position: { x, y } })
  }

  return { addWidget }
}
