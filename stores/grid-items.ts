import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  SiteItem,
  GridPosition,
  FolderUIItem,
  GridUIItem,
  FolderItem
} from '@/types'
import { db, GridItemRecord } from '@/services/database'
import { safeRun } from '@cat-kit/core'

// [itemId, childIds[]]
type OrderEntry = [string, string[]]
type Orders = OrderEntry[]

type ExcludeTimeFields<T> = Omit<T, 'createdAt' | 'updatedAt'>

const ORDERS_KEY = 'new-tab-orders'

export const useGridItemStore = defineStore('gridItems', () => {
  const ordersString = localStorage.getItem(ORDERS_KEY)
  /**
   * 排序对象
   *
   * @description
   * 一种极简的存储网格项排序和层级关系的数据结构，被用于直接映射出 items 对象，这样就无需在数据表中增加 order 字段了
   */
  const orders = ref<Orders>(
    safeRun(() => (ordersString ? JSON.parse(ordersString) : []), [])
  )

  watch(
    orders,
    newOrders => {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders))
    },
    { deep: true }
  )
  /**
   * 网格项图形结构列表
   *
   * @description 用于直接渲染网格项的结构
   */
  const items = ref<GridUIItem[]>([])

  /**
   * 网格项id映射
   */
  const itemsMap = new Map<string, GridUIItem>()

  const events: Record<string, Function> = {}

  function onLoad(cb: (items: GridUIItem[]) => void) {
    events.load = cb
  }

  function offLoad() {
    delete events.load
  }

  function setItemsMap(item: GridItemRecord) {
    const guiItem =
      item.type === 'folder' ? { ...item, children: [] } : { ...item }
    itemsMap.set(item.id, guiItem)
  }

  async function loadGridItems() {
    const gridItems = await db.gridItems.toArray()

    gridItems.forEach(setItemsMap)

    // 如果orders为空，则根据gridItems构建初始items
    if (!orders.value.length) {
      const result: GridUIItem[] = []
      gridItems.forEach(item => {
        if (item.type === 'site' && item.pid) {
          const parent = itemsMap.get(item.pid) as FolderUIItem
          if (parent) {
            parent.children.push(item)
          } else {
            console.error(`folder '${item.pid}' not found`)
          }
        } else {
          result.push(itemsMap.get(item.id)!)
        }
      })
      items.value = result
      orders.value = result.map(item => [
        item.id,
        item.type === 'folder' ? item.children.map(child => child.id) : []
      ])
    }
    // 根据orders构建items
    else {
      items.value = orders.value.map(([id, siteIds]) => {
        if (siteIds.length) {
          const folder = itemsMap.get(id) as FolderUIItem

          folder.children = siteIds.map(
            siteId => itemsMap.get(siteId) as SiteItem
          )
          return folder
        }
        return itemsMap.get(id) as SiteItem
      })
    }

    // 触发load事件
    events.load?.(items.value)
  }

  loadGridItems()

  /**
   * 添加网格项
   * @param item 网格项
   * @returns
   */
  async function addGridItem(
    item: ExcludeTimeFields<SiteItem> | ExcludeTimeFields<FolderItem>
  ) {
    const newItem = { ...item, createdAt: Date.now(), updatedAt: Date.now() }
    if (item.type === 'site' && item.pid) {
      const parent = itemsMap.get(item.pid) as FolderUIItem
      parent?.children.push(newItem as SiteItem)
    } else {
      items.value = [...items.value, newItem as GridUIItem]
    }

    setItemsMap(newItem)

    await db.gridItems.add(newItem)
  }

  /**
   * 更新网格项
   * @param id 网格项ID
   * @param updates 更新内容
   * @returns
   */
  async function updateGridItem(
    id: string,
    updates:
      | Partial<ExcludeTimeFields<SiteItem>>
      | Partial<ExcludeTimeFields<FolderItem>>
  ) {
    const oldItem = itemsMap.get(id)
    if (!oldItem) return

    const newItem = { ...oldItem, ...updates, updatedAt: Date.now() }
    itemsMap.set(id, newItem as GridUIItem)
    items.value = items.value.map(item =>
      item.id === id ? (newItem as GridUIItem) : item
    )
    await db.gridItems.update(id, updates)
  }

  /**
   * 删除网格项，子项自动移动到根级别中
   * @param ids 要删除的网格项ID列表
   * @returns
   */
  function deleteGridItems(ids: string[]) {
    ids.forEach(id => itemsMap.delete(id))
    const idSet = new Set(ids)

    const siteToMoveOut: string[] = []
    items.value = items.value.filter(item => {
      if (idSet.has(item.id)) {
        if (item.type !== 'folder') {
          siteToMoveOut.push(item.id)
        }
        return false
      }
      return true
    })
  }

  /**
   * 移动网格项到指定文件夹
   * @param id 网格项ID
   * @param pid 目标文件夹ID
   * @returns
   */
  async function moveGridItemToFolder(id: string, pid: string) {}

  async function moveGridItemOutOfFolder(ids: string[]) {}

  // 重排序
  async function reorder(newOrder: string[], pid: string | null = null) {}

  // 批量更新网格位置
  async function batchUpdateGridPositions(
    updates: Array<{ id: string; position: GridPosition }>
  ) {}

  // 批量移动网格项到文件夹
  async function batchMoveToFolder(
    ids: string[],
    targetFolderId: string | null
  ) {}

  /**
   * 所有文件夹
   */
  const folders = computed(() => {
    return items.value.filter(item => item.type === 'folder')
  })

  return {
    orders,
    items,
    itemsMap,
    folders,
    loadGridItems,

    onLoad,
    offLoad,

    addGridItem,
    updateGridItem,
    deleteGridItems,

    moveGridItemToFolder,
    moveGridItemOutOfFolder,
    reorder,
    batchUpdateGridPositions,
    batchMoveToFolder
  }
})
