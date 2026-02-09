import { GridStack, type GridStackNode, type GridStackWidget } from 'gridstack'
import { nanoid } from 'nanoid'
import { onBeforeUnmount, onMounted, useTemplateRef, render, type VNode, watch, watchEffect } from 'vue'

import type { ItemType } from '@/types/common'
import type { FolderItemForm, FolderItemUI, GridItemUI, SiteItemForm, SiteItemUI } from '@/types/ui'

import { NFolderItem } from '@/components/folder-item'
import { FOLDER_SIZE_MAP } from '@/components/folder-item/shared'
import { NSiteItem } from '@/components/site-item'
import {
  addGridItem,
  batchDeleteGridItems,
  deleteGridItem,
  gridItems,
  gridItemsMap,
  loadGridItems
} from '@/store/grid-items'
import { appendToOrder, removeFromOrder, sortByOrder, updateGridOrder } from '@/store/grid-order'
import { ui } from '@/store/ui'

/**
 * Vue 组件渲染映射表
 */
const renderMap: Record<ItemType, (item: GridItemUI) => VNode> = {
  site: (item) => {
    return <NSiteItem item={item as SiteItemUI} />
  },
  folder: (item) => <NFolderItem item={item as FolderItemUI} />
}

/**
 * 获取 widget 的网格尺寸
 * - site: 固定 1x1
 * - folder: 根据 size 预设从 FOLDER_SIZE_MAP 获取
 */
function getWidgetSize(item: GridItemUI): { w: number; h: number } {
  if (item.type === 'site') {
    return { w: 1, h: 1 }
  }
  return FOLDER_SIZE_MAP[(item as FolderItemUI).size] ?? { w: 2, h: 2 }
}

loadGridItems()

export function useGridStack(ref: string) {
  let grid: GridStack | null = null

  const gridContainer = useTemplateRef<HTMLElement>(ref)

  /** 追踪已渲染的 DOM 元素，用于清理 Vue 渲染 */
  const shadowDom: Record<string, HTMLElement> = {}

  // 设置渲染回调（必须在 init 之前）
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

    grid = GridStack.init(
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

    // 监听 removed 事件，清理对应的 Vue 渲染
    grid.on('removed', (_event: Event, items: GridStackNode[]) => {
      items.forEach((item) => {
        const id = item.id!
        if (shadowDom[id]) {
          render(null, shadowDom[id])
          delete shadowDom[id]
        }
      })
    })

    // 监听拖拽结束，保存排序到 localStorage
    grid.on('dragstop', () => {
      if (!grid) return
      const nodes = grid.engine.nodes.slice().sort((a, b) => {
        if (a.y !== b.y) return a.y! - b.y!
        return a.x! - b.x!
      })
      const ids = nodes.map((node) => node.id).filter(Boolean) as string[]
      updateGridOrder(ids)
    })
  })

  watchEffect(() => {
    if (gridItems.value.length && grid) {
      grid.load(
        gridItems.value.map((item) => {
          return { id: item.id }
        })
      )
    }
  })

  onBeforeUnmount(() => {
    // 清理所有 Vue 渲染
    Object.values(shadowDom).forEach((el) => render(null, el))
    grid?.destroy(false)
    grid = null
  })

  /**
   * 从 store 加载已有 widgets 到 GridStack
   * 按 gridOrder 排序后批量添加，不指定 x/y 让 GridStack 自动 compact
   */
  function loadWidgets() {
    if (!grid) return

    const items = Array.from(gridItemsMap.values())
    if (items.length === 0) return

    const sortedItems = sortByOrder(items)

    grid.batchUpdate(true)
    sortedItems.forEach((item) => {
      const { w, h } = getWidgetSize(item)
      grid!.addWidget({ id: item.id, w, h })
    })
    grid.batchUpdate(false)
  }

  /**
   * 添加新 widget
   */
  function addWidget(item: SiteItemForm | FolderItemForm) {
    if (!grid) return

    const id = nanoid(10)
    const newItem = { ...item, id } as GridItemUI
    addGridItem(newItem)
    appendToOrder(id)

    const { w, h } = getWidgetSize(newItem)
    grid.addWidget({ id, w, h })
  }

  /**
   * 移除 widget（同时删除数据）
   */
  function removeWidget(id: string) {
    if (!grid) return

    const el = gridContainer.value?.querySelector(`.grid-stack-item[gs-id="${id}"]`)
    if (el) {
      grid.removeWidget(el as HTMLElement)
      removeFromOrder(id)
      deleteGridItem(id)
    }
  }

  /**
   * 从 GridStack 中分离 widget（仅移除 UI，不删除数据）
   * 用于将站点移入文件夹等场景
   */
  function detachWidget(id: string) {
    if (!grid) return

    const el = gridContainer.value?.querySelector(`.grid-stack-item[gs-id="${id}"]`)
    if (el) {
      grid.removeWidget(el as HTMLElement)
      removeFromOrder(id)
    }
  }

  /**
   * 重新渲染指定 widget 的内容（数据变更后调用）
   */
  function updateWidget(id: string) {
    const el = shadowDom[id]
    if (!el) return

    const item = gridItemsMap.get(id)
    if (!item) return

    const createVNode = renderMap[item.type]
    const vnode = createVNode(item)
    render(vnode, el)
  }

  /**
   * 批量移除 widgets（同时删除数据）
   * 如果包含文件夹，其子站点也会被一并删除
   */
  function batchRemoveWidgets(ids: string[]) {
    if (!grid) return

    grid.batchUpdate(true)
    ids.forEach((id) => {
      const el = gridContainer.value?.querySelector(`.grid-stack-item[gs-id="${id}"]`)
      if (el) {
        grid!.removeWidget(el as HTMLElement)
      }
      removeFromOrder(id)
    })
    grid.batchUpdate(false)

    batchDeleteGridItems(ids)
  }

  // 编辑模式切换时，锁定/解锁网格拖拽
  watch(
    () => ui.editing,
    (editing) => {
      grid?.setStatic(editing)
    }
  )

  return { addWidget, removeWidget, detachWidget, updateWidget, loadWidgets, batchRemoveWidgets }
}
