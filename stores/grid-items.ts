import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type {
  GridItem,
  SiteItem,
  FolderItem,
  GridSize,
  GridPosition,
  SiteForm,
  FolderForm
} from '@/types'
import { db } from '@/services/database'
import { generateId } from '@/utils/id'

// [itemId, childIds[]]
type OrderEntry = [string, string[]]
type Orders = OrderEntry[]

const ORDERS_KEY = 'new-tab-orders'

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
    if (!folder || folder.type !== 'folder') return []

    const entry = orders.value.find(([id]) => id === folderId)
    if (!entry) return []

    return entry[1]
      .map(id => gridItems.value[id])
      .filter(item => item && item.type !== 'folder') as GridItem[]
  }

  // 加载网格项数据
  async function loadGridItems() {
    loading.value = true
    try {
      const items = await db.gridItems.toArray()

      const loadedItems: Record<string, GridItem> = {}
      items.forEach(item => {
        loadedItems[item.id] = item
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
      .filter(item => item.type === 'site' && !item.pid)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const newOrders: Orders = []

    rootItems.forEach(item => {
      const childrenIds: string[] = []
      if (item.type === 'folder') {
        const children = allItems
          .filter(child => child.pid === item.id && child.type !== 'folder')
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
    const normalizedOrders: Orders = []
    const seenIds = new Set<string>()

    orders.value.forEach(([id, childrenIds], index) => {
      const item = gridItems.value[id]
      if (!item) return

      newRootOrder.push(id)
      seenIds.add(id)
      item.order = index
      item.pid = null

      if (item.type === 'folder') {
        const filteredChildren = childrenIds.filter(childId => {
          const child = gridItems.value[childId]
          return child && child.type !== 'folder' && childId !== id
        })

        filteredChildren.forEach((childId, childIndex) => {
          const child = gridItems.value[childId]
          if (child) {
            child.pid = id
            child.order = childIndex
            seenIds.add(childId)
          }
        })

        normalizedOrders.push([id, filteredChildren])
      } else {
        normalizedOrders.push([id, []])
      }
    })

    const missingItems = Object.values(gridItems.value).filter(
      item => !seenIds.has(item.id)
    )
    if (missingItems.length > 0) {
      buildOrdersFromGridItems()
      return
    }

    const ordersChanged =
      JSON.stringify(normalizedOrders) !== JSON.stringify(orders.value)
    orders.value = normalizedOrders
    if (ordersChanged) {
      saveOrders()
    }

    rootOrder.value = newRootOrder
  }

  // 保存 orders 到 localStorage
  function saveOrders() {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.value))
  }

  // 保存 gridItems 到 IndexedDB
  async function persistToDb() {
    const items = Object.values(gridItems.value).map(item =>
      JSON.parse(JSON.stringify(toRaw(item)))
    )
    await db.gridItems.bulkPut(items)
  }

  // 添加网站
  async function addSite(site: Omit<SiteForm, 'id'>) {
    const id = generateId()
    const now = Date.now()

    const newSite: SiteItem = {
      id,
      type: 'site',
      order: 0, // 会被 sync 更新
      createdAt: now,
      updatedAt: now,

      ...site
    }

    gridItems.value[id] = newSite

    // 更新 orders
    const targetFolder = site.pid ? gridItems.value[site.pid] : null
    if (site.pid && targetFolder && targetFolder.type === 'folder') {
      const parentEntry = orders.value.find(e => e[0] === site.pid)
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
  async function addFolder(folder: Omit<FolderForm, 'id'>) {
    const id = generateId()
    const now = Date.now()

    const newFolder: FolderItem = {
      ...folder,
      id,
      type: 'folder',
      order: 0,
      createdAt: now,
      updatedAt: now
    }

    gridItems.value[id] = newFolder

    orders.value.push([id, []])

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
    await db.gridItems.update(id, { ...updates, updatedAt: Date.now() })
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

    const targetFolder = targetParentId ? gridItems.value[targetParentId] : null
    if (targetParentId) {
      if (!targetFolder || targetFolder.type !== 'folder') return
      if (item.type === 'folder') return
    }

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
      const childrenToKeep = item.type === 'folder' ? savedChildren : []
      orders.value.splice(targetIndex, 0, [id, childrenToKeep])
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
    if (!folder || folder.type !== 'folder') return

    // 同时更新 position 的 w 和 h
    const updatedGridPosition = folder.position
      ? { ...folder.position, w: size.w, h: size.h }
      : { x: 0, y: 0, w: size.w, h: size.h }

    // 创建新对象确保响应式更新
    const updatedFolder = {
      ...folder,
      size,
      position: updatedGridPosition,
      updatedAt: Date.now()
    }

    gridItems.value = { ...gridItems.value, [id]: updatedFolder }

    await persistToDb()
  }

  // 重排序
  async function reorder(newOrder: string[], pid: string | null = null) {
    if (pid) {
      const parent = gridItems.value[pid]
      if (!parent || parent.type !== 'folder') return
      const parentEntry = orders.value.find(e => e[0] === pid)
      if (parentEntry) {
        parentEntry[1] = newOrder.filter(id => {
          const item = gridItems.value[id]
          return item && item.type !== 'folder'
        })
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

    item.position = position
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
        item.position = position
        item.updatedAt = Date.now()
      }
    }
    await persistToDb()
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
    if (targetFolderId && (!targetFolder || targetFolder.type !== 'folder')) {
      return
    }

    for (const id of ids) {
      const item = gridItems.value[id]
      if (!item) continue
      if (item.type === 'folder') continue // 不支持移动文件夹到文件夹
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
    return Object.values(gridItems.value).filter(item => item.type === 'folder')
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
    batchDeleteGridItems,
    batchMoveToFolder
  }
})
