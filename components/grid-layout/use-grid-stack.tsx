import { throttle } from '@cat-kit/core'
import { GridStack, type GridStackNode, type GridStackWidget } from 'gridstack'
import { nanoid } from 'nanoid'
import { onBeforeUnmount, onMounted, useTemplateRef, render, type VNode, watch } from 'vue'

import type { ItemType } from '@/types/common'
import type { FolderItemForm, FolderItemUI, GridItemUI, SiteItemForm, SiteItemUI } from '@/types/ui'

import { NFolderItem } from '@/components/folder-item'
import { FOLDER_SIZE_MAP } from '@/components/folder-item/shared'
import { NSiteItem } from '@/components/site-item'
import {
  addGridItem,
  batchDeleteGridItems,
  deleteGridItem,
  gridItemsMap,
  loadGridItems
} from '@/store/grid-items'
import { appendToOrder, removeFromOrder, sortByOrder, updateGridOrder } from '@/store/grid-order'
import { ui } from '@/store/ui'

/** 判断是否为顶层项（文件夹 或 无 pid 的站点） */
function isTopLevel(item: GridItemUI): boolean {
  return item.type !== 'site' || !(item as SiteItemUI).pid
}

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

/** 存储 Promise，在 onMounted 中 await 确保数据就绪 */
const gridItemsReady = loadGridItems()

export function useGridStack(ref: string) {
  let grid: GridStack | null = null

  const gridContainer = useTemplateRef<HTMLElement>(ref)

  /** 追踪已渲染的 DOM 元素，用于清理 Vue 渲染 */
  const shadowDom: Record<string, HTMLElement> = {}

  /**
   * 通过 GridStack 引擎查找 widget 元素
   * 使用 grid.engine.nodes 替代 DOM querySelector，更可靠
   */
  function findWidgetEl(id: string): HTMLElement | undefined {
    return grid?.engine.nodes.find((n) => n.id === id)?.el as HTMLElement | undefined
  }

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

  onMounted(async () => {
    if (!gridContainer.value) return

    grid = GridStack.init(
      {
        cellHeight: 64,
        margin: 4,

        animate: false,
        disableResize: true,
        columnOpts: { columnWidth: 60, columnMax: 24, layout: 'compact' }
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

    grid.on(
      'resizecontent',
      throttle((ev, items) => {}, 300)
    )

    // 等待数据就绪后一次性加载 widgets
    await gridItemsReady
    loadWidgets()
  })

  onBeforeUnmount(() => {
    // 清理所有 Vue 渲染
    Object.values(shadowDom).forEach((el) => render(null, el))
    grid?.destroy(false)
    grid = null
  })

  /**
   * 从 store 加载已有 widgets 到 GridStack（内部方法）
   * 按 gridOrder 排序后批量添加，不指定 x/y 让 GridStack 自动 compact
   */
  function loadWidgets() {
    if (!grid) return

    // 仅加载顶层项到 GridStack，有 pid 的站点通过文件夹渲染
    const items = Array.from(gridItemsMap.values()).filter(isTopLevel)
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

    const el = findWidgetEl(id)
    if (el) {
      grid.removeWidget(el)
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

    const el = findWidgetEl(id)
    if (el) {
      grid.removeWidget(el)
      removeFromOrder(id)
    }
  }

  /**
   * 将已有项重新添加到 GridStack（数据已在 store 中）
   * 用于将站点从文件夹移出后恢复到网格
   */
  function attachWidget(id: string) {
    if (!grid) return

    const item = gridItemsMap.get(id)
    if (!item) return

    const { w, h } = getWidgetSize(item)
    appendToOrder(id)
    grid.addWidget({ id, w, h })
  }

  /**
   * 重新渲染指定 widget 的内容（数据变更后调用）
   * 同时同步更新 GridStack widget 的网格尺寸
   */
  function updateWidget(id: string) {
    const el = shadowDom[id]
    if (!el) return

    const item = gridItemsMap.get(id)
    if (!item) return

    // 同步 GridStack widget 的网格尺寸（如文件夹 size 变更时）
    const widgetEl = findWidgetEl(id)
    if (widgetEl) {
      const { w, h } = getWidgetSize(item)
      grid!.update(widgetEl, { w, h })
    }

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
      const el = findWidgetEl(id)
      if (el) {
        grid!.removeWidget(el)
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

  return { addWidget, removeWidget, detachWidget, attachWidget, updateWidget, batchRemoveWidgets }
}
