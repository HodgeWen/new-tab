import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type {
  GridItem,
  SiteItem,
  FolderItem,
  GridSize,
  GridPosition
} from '@/types'
import { isFolderItem } from '@/types'
import { db } from '@/services/database'
import { generateId } from '@/utils/id'

// [itemId, childIds[]]
type OrderEntry = [string, string[]]
type Orders = OrderEntry[]

const ORDERS_KEY = 'new-tab-orders'

/**
 * 迁移旧的 FolderSize 字符串格式到 GridSize 对象格式
 */
function migrateOldFolderSize(size: unknown): GridSize {
  // 兼容旧的字符串格式
  if (typeof size === 'string') {
    switch (size) {
      case '2x2':
        return { w: 2, h: 2 }
      case '2x1':
        return { w: 2, h: 1 }
      case '1x2':
      default:
        return { w: 1, h: 2 }
    }
  }
  // 已经是新格式
  if (typeof size === 'object' && size !== null && 'w' in size && 'h' in size) {
    return size as GridSize
  }
  return { w: 1, h: 2 }
}

/**
 * 迁移单个书签项的数据格式
 */
function migrateGridItem(item: Record<string, unknown>): GridItem {
  const migrated = { ...item } as unknown as GridItem

  // 如果是文件夹，迁移 size 字段
  if (item.type === 'folder' && 'size' in item) {
    ;(migrated as FolderItem).size = migrateOldFolderSize(item.size)
  }

  return migrated
}

export const useGridItemStore = defineStore('gridItems', () => {
  const gridItems = ref<Record<string, GridItem>>({})
  const rootOrder = ref<string[]>([])
  const orders = ref<Orders>([])
  const loading = ref(false)

  // 获取根级别的网格项
  const rootGridItems = computed(() => {
    return rootOrder.value.map(id => gridItems.value[id]).filter(Boolean)
  })

  // 获取指定文件夹的子项
  function getFolderChildren(folderId: string): GridItem[] {
    const folder = gridItems.value[folderId]
    if (!folder || !isFolderItem(folder)) return []

    return folder.children.map(id => gridItems.value[id]).filter(Boolean)
  }

  // 加载网格项数据
  async function loadGridItems() {
    loading.value = true
    try {
      const items = await db.getGridItems()

      // 迁移旧数据格式
      const loadedItems: Record<string, GridItem> = {}
      items.forEach(item => {
        loadedItems[item.id] = migrateGridItem(
          item as unknown as Record<string, unknown>
        )
      })

      gridItems.value = loadedItems

      // 加载 orders
      const rawOrders = localStorage.getItem(ORDERS_KEY)
      if (rawOrders) {
        try {
          orders.value = JSON.parse(rawOrders)
          syncGridItemsFromOrders()
        } catch (e) {
          console.error('[GridItems] Failed to parse orders:', e)
          buildOrdersFromGridItems()
        }
      } else {
        buildOrdersFromGridItems()
      }
    } finally {
      loading.value = false
    }
  }

  // 从 gridItems 构建 orders (当 localStorage 中没有 orders 时)
  function buildOrdersFromGridItems() {
    const allItems = Object.values(gridItems.value)
    const rootItems = allItems
      .filter(item => !item.parentId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const newOrders: Orders = []

    rootItems.forEach(item => {
      const childrenIds: string[] = []
      if (isFolderItem(item)) {
        const children = allItems
          .filter(child => child.parentId === item.id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        childrenIds.push(...children.map(c => c.id))
      }
      newOrders.push([item.id, childrenIds])
    })

    orders.value = newOrders
    saveOrders()
    syncGridItemsFromOrders()
  }

  // 根据 orders 同步更新 gridItems 的 hierarchy 和 order
  function syncGridItemsFromOrders() {
    const newRootOrder: string[] = []

    orders.value.forEach(([id, childrenIds], index) => {
      newRootOrder.push(id)
      const item = gridItems.value[id]
      if (item) {
        item.order = index
        item.parentId = null
        if (isFolderItem(item)) {
          // 确保 children 数组是新的引用
          item.children = [...childrenIds]
          // 更新子项
          childrenIds.forEach((childId, childIndex) => {
            const child = gridItems.value[childId]
            if (child) {
              child.parentId = id
              child.order = childIndex
            }
          })
        }
      }
    })

    rootOrder.value = newRootOrder
  }

  // 保存 orders 到 localStorage
  function saveOrders() {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.value))
  }

  // 保存 gridItems 到 IndexedDB
  async function persistToDb() {
    const items = Object.values(gridItems.value).map(item => toRaw(item))
    await db.saveGridItems(items)
  }

  // 添加网站
  async function addSite(
    site: Omit<SiteItem, 'id' | 'type' | 'order' | 'createdAt' | 'updatedAt'>
  ) {
    const id = generateId()
    const now = Date.now()

    const newSite: SiteItem = {
      id,
      type: 'site',
      order: 0, // 会被 sync 更新
      createdAt: now,
      updatedAt: now,
      ...site,
      parentId: site.parentId || null
    }

    gridItems.value[id] = newSite

    // 更新 orders
    if (site.parentId) {
      const parentEntry = orders.value.find(e => e[0] === site.parentId)
      if (parentEntry) {
        parentEntry[1].push(id)
      } else {
        // 容错：如果父级不在 orders 中（不应发生），添加到根
        orders.value.push([id, []])
      }
    } else {
      orders.value.push([id, []])
    }

    saveOrders()
    syncGridItemsFromOrders()
    await persistToDb()
    return id
  }

  // 添加文件夹
  async function addFolder(
    folder: Omit<
      FolderItem,
      'id' | 'type' | 'order' | 'children' | 'createdAt' | 'updatedAt'
    >
  ) {
    const id = generateId()
    const now = Date.now()

    const newFolder: FolderItem = {
      id,
      type: 'folder',
      order: 0,
      children: [],
      createdAt: now,
      updatedAt: now,
      ...folder,
      parentId: folder.parentId || null
    }

    gridItems.value[id] = newFolder

    if (folder.parentId) {
      // 理论上不支持文件夹嵌套，但逻辑上处理
      const parentEntry = orders.value.find(e => e[0] === folder.parentId)
      if (parentEntry) {
        parentEntry[1].push(id)
      } else {
        orders.value.push([id, []])
      }
    } else {
      orders.value.push([id, []])
    }

    saveOrders()
    syncGridItemsFromOrders()
    await persistToDb()
    return id
  }

  // 更新网格项
  async function updateGridItem(
    id: string,
    updates: Partial<SiteItem> | Partial<FolderItem>
  ) {
    const item = gridItems.value[id]
    if (!item) return

    Object.assign(item, updates, { updatedAt: Date.now() })
    await persistToDb()
  }

  // 删除网格项
  async function deleteGridItem(id: string) {
    // 从 orders 中移除
    const rootIndex = orders.value.findIndex(e => e[0] === id)
    if (rootIndex > -1) {
      // 是根级项
      const entry = orders.value[rootIndex]
      const childrenIds = entry[1]
      orders.value.splice(rootIndex, 1)

      // 如果是文件夹，将子项移到根级别
      childrenIds.forEach(childId => {
        orders.value.push([childId, []])
      })
    } else {
      // 是子项
      for (const entry of orders.value) {
        const childIndex = entry[1].indexOf(id)
        if (childIndex > -1) {
          entry[1].splice(childIndex, 1)
          break
        }
      }
    }

    delete gridItems.value[id]
    saveOrders()
    syncGridItemsFromOrders()
    await persistToDb()
  }

  // 移动网格项到指定位置
  async function moveGridItem(
    id: string,
    targetParentId: string | null,
    targetIndex: number
  ) {
    const item = gridItems.value[id]
    if (!item) return

    // 1. 从原位置移除
    let savedChildren: string[] = []

    const rootIndex = orders.value.findIndex(e => e[0] === id)
    if (rootIndex > -1) {
      savedChildren = orders.value[rootIndex][1]
      orders.value.splice(rootIndex, 1)
    } else {
      for (const entry of orders.value) {
        const childIndex = entry[1].indexOf(id)
        if (childIndex > -1) {
          entry[1].splice(childIndex, 1)
          break
        }
      }
    }

    // 2. 插入新位置
    if (targetParentId) {
      const parentEntry = orders.value.find(e => e[0] === targetParentId)
      if (parentEntry) {
        parentEntry[1].splice(targetIndex, 0, id)
      }
    } else {
      // 只有当它是文件夹或者它原本在根级且有子项时，我们需要保留子项
      // 如果它原本是子项（site），savedChildren 是空的，这也正确
      orders.value.splice(targetIndex, 0, [id, savedChildren])
    }

    item.updatedAt = Date.now()
    saveOrders()
    syncGridItemsFromOrders()
    // 拖拽操作通常频繁，这里可以选择不立即 persistToDb，或者防抖
    // 根据 proposal，可以在页面卸载或特定时机保存。这里为了安全还是保存一下，或者依靠 saveOrders
    await persistToDb()
  }

  // 更新文件夹尺寸
  async function updateFolderSize(id: string, size: GridSize) {
    const folder = gridItems.value[id]
    if (!folder || !isFolderItem(folder)) return

    // 同时更新 gridPosition 的 w 和 h
    const updatedGridPosition = folder.gridPosition
      ? {
          ...folder.gridPosition,
          w: size.w,
          h: size.h
        }
      : {
          x: 0,
          y: 0,
          w: size.w,
          h: size.h
        }

    // 创建新对象确保响应式更新
    const updatedFolder = {
      ...folder,
      size,
      gridPosition: updatedGridPosition,
      updatedAt: Date.now()
    }

    gridItems.value = {
      ...gridItems.value,
      [id]: updatedFolder
    }

    await persistToDb()
  }

  // 重排序
  async function reorder(newOrder: string[], parentId: string | null = null) {
    if (parentId) {
      const parentEntry = orders.value.find(e => e[0] === parentId)
      if (parentEntry) {
        parentEntry[1] = [...newOrder]
      }
    } else {
      // 重构根 orders
      const newOrders: Orders = []
      newOrder.forEach(id => {
        const existingEntry = orders.value.find(e => e[0] === id)
        if (existingEntry) {
          newOrders.push(existingEntry)
        } else {
          // 容错
          newOrders.push([id, []])
        }
      })
      orders.value = newOrders
    }

    saveOrders()
    syncGridItemsFromOrders()
    // reorder 也是频繁操作，可以暂不 persistToDb
  }

  // 更新单个网格项的网格位置
  async function updateGridPosition(id: string, position: GridPosition) {
    const item = gridItems.value[id]
    if (!item) return

    item.gridPosition = position
    item.updatedAt = Date.now()
    await persistToDb()
  }

  // 批量更新网格位置
  async function batchUpdateGridPositions(
    updates: Array<{ id: string; position: GridPosition }>
  ) {
    for (const { id, position } of updates) {
      const item = gridItems.value[id]
      if (item) {
        item.gridPosition = position
        item.updatedAt = Date.now()
      }
    }
    await persistToDb()
  }

  // 迁移旧数据到网格布局
  function migrateToGridLayout(colCount: number = 8): boolean {
    const rootItems = rootGridItems.value
    let needsMigration = false

    for (const item of rootItems) {
      if (!item.gridPosition) {
        needsMigration = true
        break
      }
    }

    if (!needsMigration) return false

    let currentX = 0
    let currentY = 0

    for (const item of rootItems) {
      if (item.gridPosition) continue

      let w = 1
      let h = 1
      if (isFolderItem(item)) {
        w = item.size.w
        h = item.size.h
      }

      if (currentX + w > colCount) {
        currentX = 0
        currentY++
      }

      item.gridPosition = { x: currentX, y: currentY, w, h }
      currentX += w
    }

    // 迁移后保存
    persistToDb()
    return true
  }

  // 批量删除网格项
  async function batchDeleteGridItems(ids: string[]) {
    for (const id of ids) {
      // 从 orders 移除
      const rootIndex = orders.value.findIndex(e => e[0] === id)
      if (rootIndex > -1) {
        const entry = orders.value[rootIndex]
        const childrenIds = entry[1]
        orders.value.splice(rootIndex, 1)
        childrenIds.forEach(childId => orders.value.push([childId, []]))
      } else {
        for (const entry of orders.value) {
          const childIndex = entry[1].indexOf(id)
          if (childIndex > -1) {
            entry[1].splice(childIndex, 1)
            break
          }
        }
      }
      delete gridItems.value[id]
    }

    saveOrders()
    syncGridItemsFromOrders()
    await persistToDb()
  }

  // 批量移动网格项到文件夹
  async function batchMoveToFolder(
    ids: string[],
    targetFolderId: string | null
  ) {
    const targetFolder = targetFolderId ? gridItems.value[targetFolderId] : null
    if (targetFolderId && (!targetFolder || !isFolderItem(targetFolder))) {
      return
    }

    for (const id of ids) {
      const item = gridItems.value[id]
      if (!item) continue
      if (isFolderItem(item)) continue // 不支持移动文件夹到文件夹
      if (id === targetFolderId) continue

      // 1. 移除
      const rootIndex = orders.value.findIndex(e => e[0] === id)
      if (rootIndex > -1) {
        orders.value.splice(rootIndex, 1)
      } else {
        for (const entry of orders.value) {
          const childIndex = entry[1].indexOf(id)
          if (childIndex > -1) {
            entry[1].splice(childIndex, 1)
            break
          }
        }
      }

      // 2. 添加到新位置
      if (targetFolderId) {
        const parentEntry = orders.value.find(e => e[0] === targetFolderId)
        if (parentEntry) {
          parentEntry[1].push(id)
        }
      } else {
        orders.value.push([id, []])
      }

      item.updatedAt = Date.now()
    }

    saveOrders()
    syncGridItemsFromOrders()
    await persistToDb()
  }

  // 获取所有文件夹
  const allFolders = computed(() => {
    return Object.values(gridItems.value).filter(isFolderItem) as FolderItem[]
  })

  return {
    // State
    gridItems,
    rootOrder,
    loading,

    // Computed
    rootGridItems,
    allFolders,

    // Methods
    getFolderChildren,
    loadGridItems,
    addSite,
    addFolder,
    updateGridItem,
    deleteGridItem,
    moveGridItem,
    updateFolderSize,
    reorder,
    updateGridPosition,
    batchUpdateGridPositions,
    migrateToGridLayout,
    batchDeleteGridItems,
    batchMoveToFolder
  }
})
