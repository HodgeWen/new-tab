import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type {
  BookmarkItem,
  SiteItem,
  FolderItem,
  FolderSize,
  GridPosition
} from '@/types'
import { isFolderItem } from '@/types'
import { db } from '@/services/database'
import { generateId } from '@/utils/id'

/**
 * 根据文件夹尺寸获取网格尺寸
 */
function getFolderGridSize(size: FolderSize): { w: number; h: number } {
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

export const useBookmarkStore = defineStore('bookmarks', () => {
  const bookmarks = ref<Record<string, BookmarkItem>>({})
  const rootOrder = ref<string[]>([])
  const loading = ref(false)

  // 获取根级别的书签
  const rootBookmarks = computed(() => {
    return rootOrder.value.map(id => bookmarks.value[id]).filter(Boolean)
  })

  // 获取指定文件夹的子项
  function getFolderChildren(folderId: string): BookmarkItem[] {
    const folder = bookmarks.value[folderId]
    if (!folder || !isFolderItem(folder)) return []

    return folder.children.map(id => bookmarks.value[id]).filter(Boolean)
  }

  // 加载书签数据
  async function loadBookmarks() {
    loading.value = true
    try {
      const data = await db.getBookmarks()

      const loadedBookmarks = data.bookmarks || {}
      let loadedRootOrder = Array.isArray(data.rootOrder)
        ? [...data.rootOrder]
        : []

      // 修复数据不一致：如果有书签但 rootOrder 为空，重建 rootOrder
      const bookmarkIds = Object.keys(loadedBookmarks)
      const rootLevelIds = bookmarkIds.filter(id => {
        const item = loadedBookmarks[id]
        return item && item.parentId === null
      })

      if (rootLevelIds.length > 0 && loadedRootOrder.length === 0) {
        loadedRootOrder = rootLevelIds
      }

      // 确保 rootOrder 中的 ID 都存在于 bookmarks 中
      loadedRootOrder = loadedRootOrder.filter(id => id in loadedBookmarks)

      // 添加缺失的根级别书签到 rootOrder
      for (const id of rootLevelIds) {
        if (!loadedRootOrder.includes(id)) {
          loadedRootOrder.push(id)
        }
      }

      // 使用扩展运算符确保响应式更新
      bookmarks.value = { ...loadedBookmarks }
      rootOrder.value = [...loadedRootOrder]

      // 如果修复了数据，保存修复后的数据
      if (data.rootOrder?.length !== loadedRootOrder.length) {
        await saveBookmarks()
      }
    } finally {
      loading.value = false
    }
  }

  // 保存书签数据
  async function saveBookmarks() {
    // 使用 toRaw 获取原始对象，确保正确序列化
    const rawBookmarks = JSON.parse(JSON.stringify(toRaw(bookmarks.value)))
    const rawRootOrder = JSON.parse(JSON.stringify(toRaw(rootOrder.value)))
    await db.saveBookmarks(rawBookmarks, rawRootOrder)
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

    // 更新 bookmarks
    bookmarks.value = { ...bookmarks.value, [id]: newSite }

    if (site.parentId) {
      const parent = bookmarks.value[site.parentId]
      if (parent && isFolderItem(parent)) {
        parent.children = [...parent.children, id]
      }
    } else {
      // 添加到 rootOrder
      currentRootOrder.push(id)
      rootOrder.value = currentRootOrder
    }

    await saveBookmarks()
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

    // 更新 bookmarks
    bookmarks.value = { ...bookmarks.value, [id]: newFolder }

    if (folder.parentId) {
      const parent = bookmarks.value[folder.parentId]
      if (parent && isFolderItem(parent)) {
        parent.children = [...parent.children, id]
      }
    } else {
      // 添加到 rootOrder
      currentRootOrder.push(id)
      rootOrder.value = currentRootOrder
    }

    await saveBookmarks()
    return id
  }

  // 更新书签
  async function updateBookmark(id: string, updates: Partial<BookmarkItem>) {
    const bookmark = bookmarks.value[id]
    if (!bookmark) return

    Object.assign(bookmark, updates, { updatedAt: Date.now() })
    await saveBookmarks()
  }

  // 删除书签
  async function deleteBookmark(id: string) {
    const bookmark = bookmarks.value[id]
    if (!bookmark) return

    // 如果是文件夹，将子项移到根级别
    if (isFolderItem(bookmark)) {
      for (const childId of bookmark.children) {
        const child = bookmarks.value[childId]
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
    if (bookmark.parentId) {
      const parent = bookmarks.value[bookmark.parentId]
      if (parent && isFolderItem(parent)) {
        const index = parent.children.indexOf(id)
        if (index > -1) parent.children.splice(index, 1)
      }
    } else {
      const index = rootOrder.value.indexOf(id)
      if (index > -1) rootOrder.value.splice(index, 1)
    }

    delete bookmarks.value[id]
    await saveBookmarks()
  }

  // 移动书签到指定位置
  async function moveBookmark(
    id: string,
    targetParentId: string | null,
    targetIndex: number
  ) {
    const bookmark = bookmarks.value[id]
    if (!bookmark) return

    // 从原位置移除
    if (bookmark.parentId) {
      const oldParent = bookmarks.value[bookmark.parentId]
      if (oldParent && isFolderItem(oldParent)) {
        const index = oldParent.children.indexOf(id)
        if (index > -1) oldParent.children.splice(index, 1)
      }
    } else {
      const index = rootOrder.value.indexOf(id)
      if (index > -1) rootOrder.value.splice(index, 1)
    }

    // 添加到新位置
    bookmark.parentId = targetParentId
    if (targetParentId) {
      const newParent = bookmarks.value[targetParentId]
      if (newParent && isFolderItem(newParent)) {
        newParent.children.splice(targetIndex, 0, id)
      }
    } else {
      rootOrder.value.splice(targetIndex, 0, id)
    }

    bookmark.updatedAt = Date.now()
    await saveBookmarks()
  }

  // 更新文件夹尺寸
  async function updateFolderSize(id: string, size: FolderSize) {
    const folder = bookmarks.value[id]
    if (!folder || !isFolderItem(folder)) return

    // 获取新尺寸的网格尺寸
    const newGridSize = getFolderGridSize(size)

    // 同时更新 gridPosition 的 w 和 h
    const updatedGridPosition = folder.gridPosition
      ? {
          ...folder.gridPosition,
          w: newGridSize.w,
          h: newGridSize.h
        }
      : {
          x: 0,
          y: 0,
          w: newGridSize.w,
          h: newGridSize.h
        }

    // 创建新对象确保响应式更新
    const updatedFolder = {
      ...folder,
      size,
      gridPosition: updatedGridPosition,
      updatedAt: Date.now()
    }

    // 触发响应式更新
    bookmarks.value = {
      ...bookmarks.value,
      [id]: updatedFolder
    }

    await saveBookmarks()
  }

  // 重排序
  async function reorder(newOrder: string[], parentId: string | null = null) {
    if (parentId) {
      const parent = bookmarks.value[parentId]
      if (parent && isFolderItem(parent)) {
        parent.children = newOrder
      }
    } else {
      rootOrder.value = [...newOrder]
    }
    await saveBookmarks()
  }

  // 更新单个书签的网格位置
  async function updateGridPosition(id: string, position: GridPosition) {
    const bookmark = bookmarks.value[id]
    if (!bookmark) return

    bookmark.gridPosition = position
    bookmark.updatedAt = Date.now()
    await saveBookmarks()
  }

  // 批量更新网格位置（用于拖拽结束时同步多个项目的位置）
  async function batchUpdateGridPositions(
    updates: Array<{ id: string; position: GridPosition }>
  ) {
    for (const { id, position } of updates) {
      const bookmark = bookmarks.value[id]
      if (bookmark) {
        bookmark.gridPosition = position
        bookmark.updatedAt = Date.now()
      }
    }
    await saveBookmarks()
  }

  // 迁移旧数据到网格布局（将 rootOrder 顺序转换为网格位置）
  function migrateToGridLayout(colCount: number = 8): boolean {
    const rootItems = rootBookmarks.value
    let needsMigration = false

    // 检查是否需要迁移（存在没有 gridPosition 的根级书签）
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
        const size = getFolderGridSize(item.size)
        w = size.w
        h = size.h
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

  // 批量删除书签
  async function batchDeleteBookmarks(ids: string[]) {
    for (const id of ids) {
      const bookmark = bookmarks.value[id]
      if (!bookmark) continue

      // 如果是文件夹，将子项移到根级别
      if (isFolderItem(bookmark)) {
        for (const childId of bookmark.children) {
          const child = bookmarks.value[childId]
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
      if (bookmark.parentId) {
        const parent = bookmarks.value[bookmark.parentId]
        if (parent && isFolderItem(parent)) {
          const index = parent.children.indexOf(id)
          if (index > -1) parent.children.splice(index, 1)
        }
      } else {
        const index = rootOrder.value.indexOf(id)
        if (index > -1) rootOrder.value.splice(index, 1)
      }

      delete bookmarks.value[id]
    }

    await saveBookmarks()
  }

  // 批量移动书签到文件夹
  async function batchMoveToFolder(ids: string[], targetFolderId: string | null) {
    const targetFolder = targetFolderId ? bookmarks.value[targetFolderId] : null

    // 如果目标是文件夹，确保它存在且是文件夹类型
    if (targetFolderId && (!targetFolder || !isFolderItem(targetFolder))) {
      return
    }

    for (const id of ids) {
      const bookmark = bookmarks.value[id]
      if (!bookmark) continue

      // 不能将文件夹移动到其他文件夹
      if (isFolderItem(bookmark)) continue

      // 不能将项目移动到自己
      if (id === targetFolderId) continue

      // 从原位置移除
      if (bookmark.parentId) {
        const oldParent = bookmarks.value[bookmark.parentId]
        if (oldParent && isFolderItem(oldParent)) {
          const index = oldParent.children.indexOf(id)
          if (index > -1) oldParent.children.splice(index, 1)
        }
      } else {
        const index = rootOrder.value.indexOf(id)
        if (index > -1) rootOrder.value.splice(index, 1)
      }

      // 添加到新位置
      bookmark.parentId = targetFolderId

      if (targetFolderId && targetFolder && isFolderItem(targetFolder)) {
        targetFolder.children = [...targetFolder.children, id]
      } else {
        // 移动到根级别
        rootOrder.value = [...rootOrder.value, id]
      }

      bookmark.updatedAt = Date.now()
    }

    await saveBookmarks()
  }

  // 获取所有文件夹
  const allFolders = computed(() => {
    return Object.values(bookmarks.value).filter(isFolderItem) as FolderItem[]
  })

  return {
    bookmarks,
    rootOrder,
    loading,
    rootBookmarks,
    allFolders,
    getFolderChildren,
    loadBookmarks,
    addSite,
    addFolder,
    updateBookmark,
    deleteBookmark,
    moveBookmark,
    updateFolderSize,
    reorder,
    updateGridPosition,
    batchUpdateGridPositions,
    migrateToGridLayout,
    batchDeleteBookmarks,
    batchMoveToFolder
  }
})
