import { onBeforeUnmount, onMounted, useTemplateRef, type VNode } from 'vue'

import { isFolderItem, isSiteItem, type GridItemUI } from '@/types/ui'

import { NFolderItem } from '@/components/folder-item'
import { FOLDER_SIZE_MAP } from '@/components/folder-item/shared'
import { NSiteItem } from '@/components/site-item'
import { gridItemsMap } from '@/store/grid-items'

import { createGridStackCore } from './use-grid-stack-core'
import { createGridStackRenderer } from './use-grid-stack-renderer'

function isTopLevel(item: GridItemUI): boolean {
  if (isFolderItem(item)) return true
  return !item.pid
}

function renderWidget(item: GridItemUI): VNode {
  if (isSiteItem(item)) return <NSiteItem item={item} />
  return <NFolderItem item={item} />
}

function getWidgetSize(item: GridItemUI): { w: number; h: number } {
  if (isSiteItem(item)) return { w: 1, h: 1 }
  return FOLDER_SIZE_MAP[item.size] ?? { w: 2, h: 2 }
}

export function useGridStack(ref: string) {
  const gridContainer = useTemplateRef<HTMLElement>(ref)
  const renderer = createGridStackRenderer({
    getGridItem: (id) => gridItemsMap.get(id),
    renderWidget
  })
  const core = createGridStackCore({
    gridContainer,
    renderer,
    isTopLevel,
    getWidgetSize
  })

  onMounted(async () => {
    renderer.installRenderCallback()
    await core.mount()
  })

  onBeforeUnmount(() => {
    core.unmount()
    renderer.cleanupAll()
    renderer.restoreRenderCallback()
  })

  return {
    addWidget: core.addWidget,
    removeWidget: core.removeWidget,
    detachWidget: core.detachWidget,
    attachWidget: core.attachWidget,
    updateWidget: core.updateWidget,
    batchRemoveWidgets: core.batchRemoveWidgets,
    reloadWidgets: core.reloadWidgets
  }
}
