import { GridStack, type GridStackNode } from 'gridstack'
import { nanoid } from 'nanoid'
import { watch, type WatchStopHandle } from 'vue'
import type { FolderItemForm, GridItemUI, SiteItemForm } from '@/types/ui'
import { addGridItem, batchDeleteGridItems, deleteGridItem, gridItemsMap, loadGridItems } from '@/store/grid-items'
import { appendToOrder, removeFromOrder, sortByOrder, updateGridOrder } from '@/store/grid-order'
import { ui } from '@/store/ui'
import type { GridStackRenderer } from './use-grid-stack-renderer'

const GRID_CELL_HEIGHT = 64
const GRID_MARGIN = 4
const GRID_COLUMN_WIDTH = 60
const GRID_COLUMN_MAX = 24
const DRAGSTOP_DEBOUNCE_MS = 140
const gridItemsReady = loadGridItems()

type ElementRef = Readonly<{ value: HTMLElement | null | undefined }>
type CoreOptions = {
  gridContainer: ElementRef
  renderer: Pick<GridStackRenderer, 'cleanupRemoved' | 'findWidgetEl' | 'renderWidgetById'>
  isTopLevel: (item: GridItemUI) => boolean
  getWidgetSize: (item: GridItemUI) => { w: number; h: number }
}

export function createGridStackCore(options: CoreOptions) {
  let grid: GridStack | null = null
  let stopEditingWatch: WatchStopHandle | null = null
  let dragstopTimer: ReturnType<typeof setTimeout> | null = null
  const findGridWidgetEl = (id: string): HTMLElement | undefined => {
    const el = grid?.engine.nodes.find((node) => node.id === id)?.el
    return el instanceof HTMLElement ? el : undefined
  }
  const findWidgetEl = (id: string) => options.renderer.findWidgetEl(id) ?? findGridWidgetEl(id)
  const clearDragstopTimer = () => {
    if (!dragstopTimer) return
    clearTimeout(dragstopTimer)
    dragstopTimer = null
  }
  const commitOrder = () => {
    if (!grid) return
    const ids = grid.engine.nodes
      .slice()
      .sort((a, b) => (a.y === b.y ? (a.x ?? 0) - (b.x ?? 0) : (a.y ?? 0) - (b.y ?? 0)))
      .map((node) => node.id)
      .filter((id): id is string => id != null)
    updateGridOrder(ids)
  }
  const scheduleOrderCommit = () => {
    clearDragstopTimer()
    dragstopTimer = setTimeout(() => {
      dragstopTimer = null
      commitOrder()
    }, DRAGSTOP_DEBOUNCE_MS)
  }

  function loadWidgets() {
    if (!grid) return
    const items = sortByOrder(Array.from(gridItemsMap.values()).filter(options.isTopLevel))
    if (!items.length) return
    grid.batchUpdate(true)
    items.forEach((item) => {
      const { w, h } = options.getWidgetSize(item)
      grid!.addWidget({ id: item.id, w, h })
    })
    grid.batchUpdate(false)
  }

  function reloadWidgets() {
    if (!grid) return
    clearDragstopTimer()
    grid.batchUpdate(true)
    grid.engine.nodes.slice().forEach((node) => node.el && grid!.removeWidget(node.el))
    grid.batchUpdate(false)
    loadWidgets()
  }

  function addWidget(item: SiteItemForm | FolderItemForm) {
    if (!grid) return
    const id = nanoid(10)
    const newItem: GridItemUI = item.type === 'site' ? { ...item, id } : { ...item, id }
    addGridItem(newItem)
    appendToOrder(id)
    const { w, h } = options.getWidgetSize(newItem)
    grid.addWidget({ id, w, h })
  }

  function removeWidget(id: string) {
    if (!grid) return
    const el = findWidgetEl(id)
    if (!el) return
    grid.removeWidget(el)
    removeFromOrder(id)
    deleteGridItem(id)
  }

  function detachWidget(id: string) {
    if (!grid) return
    const el = findWidgetEl(id)
    if (!el) return
    grid.removeWidget(el)
    removeFromOrder(id)
  }

  function attachWidget(id: string) {
    if (!grid) return
    const item = gridItemsMap.get(id)
    if (!item) return
    const { w, h } = options.getWidgetSize(item)
    appendToOrder(id)
    grid.addWidget({ id, w, h })
  }

  function updateWidget(id: string) {
    const item = gridItemsMap.get(id)
    if (!item) return
    const el = findWidgetEl(id)
    if (grid && el) {
      const { w, h } = options.getWidgetSize(item)
      grid.update(el, { w, h })
    }
    options.renderer.renderWidgetById(id)
  }

  function batchRemoveWidgets(ids: string[]) {
    if (!grid) return
    grid.batchUpdate(true)
    ids.forEach((id) => {
      const el = findWidgetEl(id)
      if (el) grid!.removeWidget(el)
      removeFromOrder(id)
    })
    grid.batchUpdate(false)
    batchDeleteGridItems(ids)
  }

  async function mount() {
    const container = options.gridContainer.value
    if (!container) return
    clearDragstopTimer()
    grid = GridStack.init(
      { cellHeight: GRID_CELL_HEIGHT, margin: GRID_MARGIN, animate: false, disableResize: true,
        columnOpts: { columnWidth: GRID_COLUMN_WIDTH, columnMax: GRID_COLUMN_MAX, layout: 'compact' } },
      container
    )
    grid.on('removed', (_event: Event, items: GridStackNode[]) => options.renderer.cleanupRemoved(items))
    grid.on('dragstop', scheduleOrderCommit)
    stopEditingWatch = watch(() => ui.editing, (editing) => grid?.setStatic(editing), { immediate: true })
    await gridItemsReady
    loadWidgets()
  }

  function unmount() {
    clearDragstopTimer()
    stopEditingWatch?.()
    stopEditingWatch = null
    grid?.destroy(false)
    grid = null
  }

  return { mount, unmount, reloadWidgets, addWidget, removeWidget, detachWidget, attachWidget, updateWidget, batchRemoveWidgets }
}
