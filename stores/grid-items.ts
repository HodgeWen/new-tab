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
  const deleteCallbacks: ((ids: string[]) => void)[] = []
  const updateCallbacks: ((id: string, updates: Partial<GridUIItem>) => void)[] = []

  function onLoad(cb: (items: GridUIItem[]) => void) {
    events.load = cb
  }

  function offLoad() {
    delete events.load
  }

  function onDelete(cb: (ids: string[]) => void) {
    deleteCallbacks.push(cb)
  }

  function offDelete(cb: (ids: string[]) => void) {
    const index = deleteCallbacks.indexOf(cb)
    if (index > -1) {
      deleteCallbacks.splice(index, 1)
    }
  }

  function onUpdate(cb: (id: string, updates: Partial<GridUIItem>) => void) {
    updateCallbacks.push(cb)
  }

  function offUpdate(cb: (id: string, updates: Partial<GridUIItem>) => void) {
    const index = updateCallbacks.indexOf(cb)
    if (index > -1) {
      updateCallbacks.splice(index, 1)
    }
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
      // 更新 orders 中对应文件夹的子项列表
      const orderEntry = orders.value.find(([id]) => id === item.pid)
      if (orderEntry) {
        orderEntry[1].push(newItem.id)
      }
    } else {
      items.value = [...items.value, newItem as GridUIItem]
      // 添加到根级别的 orders
      orders.value = [
        ...orders.value,
        [newItem.id, newItem.type === 'folder' ? [] : []]
      ]
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
    await db.gridItems.update(id, { ...updates, updatedAt: Date.now() })

    // 触发更新事件
    updateCallbacks.forEach(cb => cb(id, updates))
  }

  /**
   * 删除网格项，子项自动移动到根级别中
   * @param ids 要删除的网格项ID列表
   * @returns
   */
  async function deleteGridItems(ids: string[]) {
    const idSet = new Set(ids)
    const childrenToMoveOut: SiteItem[] = []

    // 收集要删除的文件夹的子项
    ids.forEach(id => {
      const item = itemsMap.get(id)
      if (item?.type === 'folder') {
        childrenToMoveOut.push(...item.children)
      }
    })

    // 从 itemsMap 中删除
    ids.forEach(id => itemsMap.delete(id))

    // 更新 items，同时将文件夹子项移到根级别
    items.value = items.value.filter(item => !idSet.has(item.id))
    if (childrenToMoveOut.length > 0) {
      items.value = [...items.value, ...childrenToMoveOut]
    }

    // 更新 orders
    orders.value = orders.value.filter(([id]) => !idSet.has(id))
    // 将移出的子项添加到 orders
    childrenToMoveOut.forEach(child => {
      orders.value.push([child.id, []])
    })

    // 更新数据库：删除项
    await db.gridItems.bulkDelete(ids)

    // 更新数据库：将子项的 pid 设为 null
    if (childrenToMoveOut.length > 0) {
      await Promise.all(
        childrenToMoveOut.map(child =>
          db.gridItems.update(child.id, { pid: null, updatedAt: Date.now() } as Partial<SiteItem>)
        )
      )
    }

    // 触发删除事件，通知 grid-container 移除 widget
    deleteCallbacks.forEach(cb => cb(ids))
  }

  /**
   * 批量删除网格项
   * @param ids 要删除的网格项ID列表
   */
  async function batchDeleteGridItems(ids: string[]) {
    await deleteGridItems(ids)
  }

  /**
   * 移动网格项到指定文件夹
   * @param id 网格项ID
   * @param pid 目标文件夹ID
   * @returns
   */
  async function moveGridItemToFolder(id: string, pid: string) {
    const item = itemsMap.get(id) as SiteItem
    if (!item || item.type !== 'site') return

    const targetFolder = itemsMap.get(pid) as FolderUIItem
    if (!targetFolder || targetFolder.type !== 'folder') return

    // 从原位置移除
    if (item.pid) {
      // 从原文件夹移除
      const oldFolder = itemsMap.get(item.pid) as FolderUIItem
      if (oldFolder) {
        oldFolder.children = oldFolder.children.filter(c => c.id !== id)
        // 更新 orders 中原文件夹的子项
        const oldOrderEntry = orders.value.find(([oid]) => oid === item.pid)
        if (oldOrderEntry) {
          oldOrderEntry[1] = oldOrderEntry[1].filter(cid => cid !== id)
        }
      }
    } else {
      // 从根级别移除
      items.value = items.value.filter(i => i.id !== id)
      orders.value = orders.value.filter(([oid]) => oid !== id)
    }

    // 添加到目标文件夹
    item.pid = pid
    targetFolder.children.push(item)
    itemsMap.set(id, item)

    // 更新 orders 中目标文件夹的子项
    const targetOrderEntry = orders.value.find(([oid]) => oid === pid)
    if (targetOrderEntry) {
      targetOrderEntry[1].push(id)
    }

    // 更新数据库
    await db.gridItems.update(id, { pid, updatedAt: Date.now() } as Partial<SiteItem>)
  }

  async function moveGridItemOutOfFolder(ids: string[]) {
    for (const id of ids) {
      const item = itemsMap.get(id) as SiteItem
      if (!item || !item.pid) continue

      const oldFolder = itemsMap.get(item.pid) as FolderUIItem
      if (oldFolder) {
        oldFolder.children = oldFolder.children.filter(c => c.id !== id)
        // 更新 orders 中原文件夹的子项
        const oldOrderEntry = orders.value.find(([oid]) => oid === item.pid)
        if (oldOrderEntry) {
          oldOrderEntry[1] = oldOrderEntry[1].filter(cid => cid !== id)
        }
      }

      // 移到根级别
      item.pid = null
      items.value = [...items.value, item]
      orders.value = [...orders.value, [id, []]]
      itemsMap.set(id, item)

      // 更新数据库
      await db.gridItems.update(id, { pid: null, updatedAt: Date.now() } as Partial<SiteItem>)
    }
  }

  // 重排序
  async function reorder(newOrder: string[], pid: string | null = null) {
    if (pid) {
      // 文件夹内重排序
      const folder = itemsMap.get(pid) as FolderUIItem
      if (!folder || folder.type !== 'folder') return

      folder.children = newOrder.map(id => itemsMap.get(id) as SiteItem)
      // 更新 orders
      const orderEntry = orders.value.find(([oid]) => oid === pid)
      if (orderEntry) {
        orderEntry[1] = newOrder
      }
    } else {
      // 根级别重排序
      items.value = newOrder.map(id => itemsMap.get(id) as GridUIItem)
      // 重建 orders，保持子项不变
      const oldOrdersMap = new Map(orders.value)
      orders.value = newOrder.map(id => [id, oldOrdersMap.get(id)?.[1] ?? []] as OrderEntry)
    }
  }

  // 批量更新网格位置
  async function batchUpdateGridPositions(
    updates: Array<{ id: string; position: GridPosition }>
  ) {
    const now = Date.now()

    // 更新内存
    for (const { id, position } of updates) {
      const item = itemsMap.get(id)
      if (item) {
        item.position = position
        itemsMap.set(id, item)
      }
    }

    // 批量更新数据库
    await Promise.all(
      updates.map(({ id, position }) =>
        db.gridItems.update(id, { position, updatedAt: now })
      )
    )
  }

  // 批量移动网格项到文件夹
  async function batchMoveToFolder(
    ids: string[],
    targetFolderId: string | null
  ) {
    if (targetFolderId) {
      for (const id of ids) {
        await moveGridItemToFolder(id, targetFolderId)
      }
    } else {
      await moveGridItemOutOfFolder(ids)
    }
  }

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
    onDelete,
    offDelete,
    onUpdate,
    offUpdate,

    addGridItem,
    updateGridItem,
    deleteGridItems,
    batchDeleteGridItems,

    moveGridItemToFolder,
    moveGridItemOutOfFolder,
    reorder,
    batchUpdateGridPositions,
    batchMoveToFolder
  }
})
