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
      const data = await db.getBookmarks()

      // 迁移旧数据格式
      const loadedItems: Record<string, GridItem> = {}
      for (const [id, item] of Object.entries(data.bookmarks || {})) {
        loadedItems[id] = migrateGridItem(
          item as unknown as Record<string, unknown>
        )
      }

      let loadedRootOrder = Array.isArray(data.rootOrder)
        ? [...data.rootOrder]
        : []

      // 修复数据不一致：如果有网格项但 rootOrder 为空，重建 rootOrder
      const itemIds = Object.keys(loadedItems)
      const rootLevelIds = itemIds.filter(id => {
        const item = loadedItems[id]
        return item && item.parentId === null
      })

      if (rootLevelIds.length > 0 && loadedRootOrder.length === 0) {
        loadedRootOrder = rootLevelIds
      }

      // 确保 rootOrder 中的 ID 都存在于 gridItems 中
      loadedRootOrder = loadedRootOrder.filter(id => id in loadedItems)

      // 添加缺失的根级别项到 rootOrder
      for (const id of rootLevelIds) {
        if (!loadedRootOrder.includes(id)) {
          loadedRootOrder.push(id)
        }
      }

      // 使用扩展运算符确保响应式更新
      gridItems.value = { ...loadedItems }
      rootOrder.value = [...loadedRootOrder]

      // 如果修复了数据，保存修复后的数据
      if (data.rootOrder?.length !== loadedRootOrder.length) {
        await saveGridItems()
      }
    } finally {
      loading.value = false
    }
  }

  // 保存网格项数据
  async function saveGridItems() {
    // 使用 toRaw 获取原始对象，确保正确序列化
    const rawItems = JSON.parse(JSON.stringify(toRaw(gridItems.value)))
    const rawRootOrder = JSON.parse(JSON.stringify(toRaw(rootOrder.value)))
    await db.saveBookmarks(rawItems, rawRootOrder)
  }

  // 添加网站
  async function addSite(
    site: Omit<SiteItem, 'id' | 'type' | 'order' | 'createdAt' | 'updatedAt'>
  ) {
    const id = generateId()
    const now = Date.now()

    // 确保 rootOrder 是数组
    const currentRootOrder = Array.isArray(rootOrder.value)
      ? [...rootOrder.value]
      : []

    const newSite: SiteItem = {
      id,
      type: 'site',
      order: currentRootOrder.length,
      createdAt: now,
      updatedAt: now,
      ...site
    }

    // 更新 gridItems
    gridItems.value = { ...gridItems.value, [id]: newSite }

    if (site.parentId) {
      const parent = gridItems.value[site.parentId]
      if (parent && isFolderItem(parent)) {
        parent.children = [...parent.children, id]
      }
    } else {
      // 添加到 rootOrder
      currentRootOrder.push(id)
      rootOrder.value = currentRootOrder
    }

    await saveGridItems()
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

    // 确保 rootOrder 是数组
    const currentRootOrder = Array.isArray(rootOrder.value)
      ? [...rootOrder.value]
      : []

    const newFolder: FolderItem = {
      id,
      type: 'folder',
      order: currentRootOrder.length,
      children: [],
      createdAt: now,
      updatedAt: now,
      ...folder
    }

    // 更新 gridItems
    gridItems.value = { ...gridItems.value, [id]: newFolder }

    if (folder.parentId) {
      const parent = gridItems.value[folder.parentId]
      if (parent && isFolderItem(parent)) {
        parent.children = [...parent.children, id]
      }
    } else {
      // 添加到 rootOrder
      currentRootOrder.push(id)
      rootOrder.value = currentRootOrder
    }

    await saveGridItems()
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
    await saveGridItems()
  }

  // 删除网格项
  async function deleteGridItem(id: string) {
    const item = gridItems.value[id]
    if (!item) return

    // 如果是文件夹，将子项移到根级别
    if (isFolderItem(item)) {
      for (const childId of item.children) {
        const child = gridItems.value[childId]
        if (child) {
          child.parentId = null
          if (!Array.isArray(rootOrder.value)) {
            rootOrder.value = []
          }
          rootOrder.value = [...rootOrder.value, childId]
        }
      }
    }

    // 从父级移除引用
    if (item.parentId) {
      const parent = gridItems.value[item.parentId]
      if (parent && isFolderItem(parent)) {
        const index = parent.children.indexOf(id)
        if (index > -1) parent.children.splice(index, 1)
      }
    } else {
      const index = rootOrder.value.indexOf(id)
      if (index > -1) rootOrder.value.splice(index, 1)
    }

    delete gridItems.value[id]
    await saveGridItems()
  }

  // 移动网格项到指定位置
  async function moveGridItem(
    id: string,
    targetParentId: string | null,
    targetIndex: number
  ) {
    const item = gridItems.value[id]
    if (!item) return

    // 从原位置移除
    if (item.parentId) {
      const oldParent = gridItems.value[item.parentId]
      if (oldParent && isFolderItem(oldParent)) {
        const index = oldParent.children.indexOf(id)
        if (index > -1) oldParent.children.splice(index, 1)
      }
    } else {
      const index = rootOrder.value.indexOf(id)
      if (index > -1) rootOrder.value.splice(index, 1)
    }

    // 添加到新位置
    item.parentId = targetParentId
    if (targetParentId) {
      const newParent = gridItems.value[targetParentId]
      if (newParent && isFolderItem(newParent)) {
        newParent.children.splice(targetIndex, 0, id)
      }
    } else {
      rootOrder.value.splice(targetIndex, 0, id)
    }

    item.updatedAt = Date.now()
    await saveGridItems()
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

    // 触发响应式更新
    gridItems.value = {
      ...gridItems.value,
      [id]: updatedFolder
    }

    await saveGridItems()
  }

  // 重排序
  async function reorder(newOrder: string[], parentId: string | null = null) {
    if (parentId) {
      const parent = gridItems.value[parentId]
      if (parent && isFolderItem(parent)) {
        parent.children = newOrder
      }
    } else {
      rootOrder.value = [...newOrder]
    }
    await saveGridItems()
  }

  // 更新单个网格项的网格位置
  async function updateGridPosition(id: string, position: GridPosition) {
    const item = gridItems.value[id]
    if (!item) return

    item.gridPosition = position
    item.updatedAt = Date.now()
    await saveGridItems()
  }

  // 批量更新网格位置（用于拖拽结束时同步多个项目的位置）
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
    await saveGridItems()
  }

  // 迁移旧数据到网格布局（将 rootOrder 顺序转换为网格位置）
  function migrateToGridLayout(colCount: number = 8): boolean {
    const rootItems = rootGridItems.value
    let needsMigration = false

    // 检查是否需要迁移（存在没有 gridPosition 的根级网格项）
    for (const item of rootItems) {
      if (!item.gridPosition) {
        needsMigration = true
        break
      }
    }

    if (!needsMigration) return false

    // 按 rootOrder 顺序计算网格位置
    let currentX = 0
    let currentY = 0

    for (const item of rootItems) {
      if (item.gridPosition) continue

      // 获取元素尺寸
      let w = 1
      let h = 1
      if (isFolderItem(item)) {
        w = item.size.w
        h = item.size.h
      }

      // 检查是否需要换行
      if (currentX + w > colCount) {
        currentX = 0
        currentY++
      }

      // 设置位置
      item.gridPosition = { x: currentX, y: currentY, w, h }

      // 移动到下一个位置
      currentX += w
    }

    return true
  }

  // 批量删除网格项
  async function batchDeleteGridItems(ids: string[]) {
    for (const id of ids) {
      const item = gridItems.value[id]
      if (!item) continue

      // 如果是文件夹，将子项移到根级别
      if (isFolderItem(item)) {
        for (const childId of item.children) {
          const child = gridItems.value[childId]
          if (child) {
            child.parentId = null
            if (!Array.isArray(rootOrder.value)) {
              rootOrder.value = []
            }
            rootOrder.value = [...rootOrder.value, childId]
          }
        }
      }

      // 从父级移除引用
      if (item.parentId) {
        const parent = gridItems.value[item.parentId]
        if (parent && isFolderItem(parent)) {
          const index = parent.children.indexOf(id)
          if (index > -1) parent.children.splice(index, 1)
        }
      } else {
        const index = rootOrder.value.indexOf(id)
        if (index > -1) rootOrder.value.splice(index, 1)
      }

      delete gridItems.value[id]
    }

    await saveGridItems()
  }

  // 批量移动网格项到文件夹
  async function batchMoveToFolder(
    ids: string[],
    targetFolderId: string | null
  ) {
    const targetFolder = targetFolderId ? gridItems.value[targetFolderId] : null

    // 如果目标是文件夹，确保它存在且是文件夹类型
    if (targetFolderId && (!targetFolder || !isFolderItem(targetFolder))) {
      return
    }

    for (const id of ids) {
      const item = gridItems.value[id]
      if (!item) continue

      // 不能将文件夹移动到其他文件夹
      if (isFolderItem(item)) continue

      // 不能将项目移动到自己
      if (id === targetFolderId) continue

      // 从原位置移除
      if (item.parentId) {
        const oldParent = gridItems.value[item.parentId]
        if (oldParent && isFolderItem(oldParent)) {
          const index = oldParent.children.indexOf(id)
          if (index > -1) oldParent.children.splice(index, 1)
        }
      } else {
        const index = rootOrder.value.indexOf(id)
        if (index > -1) rootOrder.value.splice(index, 1)
      }

      // 添加到新位置
      item.parentId = targetFolderId

      if (targetFolderId && targetFolder && isFolderItem(targetFolder)) {
        targetFolder.children = [...targetFolder.children, id]
      } else {
        // 移动到根级别
        rootOrder.value = [...rootOrder.value, id]
      }

      item.updatedAt = Date.now()
    }

    await saveGridItems()
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
