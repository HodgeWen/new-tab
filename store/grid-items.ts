import { readonly, ref } from 'vue'

import type { GridItemRecord } from '@/types/db'
import type { FolderItemUI, GridItemUI, SiteItemUI } from '@/types/ui'
import { isFolderItem, isSiteItem } from '@/types/ui'

import { db } from '@/utils/db'

const _gridItems = ref<GridItemUI[]>([])

/** 响应式的网格项列表（只读） */
export const gridItems = readonly(_gridItems)

/** 网格项 Map，用于快速查找（运行时） */
export const gridItemsMap = new Map<string, GridItemUI>()

/** 同步列表与 Map，并构建文件夹与子站点的关系 */
function syncList() {
  // 清除所有文件夹的 sites
  for (const item of gridItemsMap.values()) {
    if (isFolderItem(item)) item.sites = []
  }
  // 根据 pid 将站点分配到对应文件夹
  for (const item of gridItemsMap.values()) {
    if (isSiteItem(item) && item.pid) {
      const folder = gridItemsMap.get(item.pid)
      if (folder && isFolderItem(folder)) {
        if (!folder.sites) folder.sites = []
        folder.sites.push(item)
      }
    }
  }
  // 仅保留顶层项（文件夹 + 无 pid 的站点），有 pid 的站点通过文件夹渲染
  _gridItems.value = Array.from(gridItemsMap.values()).filter((item) => !isSiteItem(item) || !item.pid)
}

function toPersistedItemData(item: GridItemUI): SiteItemUI | Omit<FolderItemUI, 'sites'> {
  if (isFolderItem(item)) {
    const { sites: _sites, ...folderData } = item
    return folderData
  }
  return item
}

/** 将 UI 数据转换为数据库记录（剥离运行时计算的 sites 字段） */
function toRecord(item: GridItemUI, createdAt?: number): GridItemRecord {
  const now = Date.now()
  const data = toPersistedItemData(item)
  return { ...data, createdAt: createdAt ?? now, updatedAt: now }
}

/**
 * 从数据库加载所有网格项到内存
 * 应在 GridStack 初始化后、加载 widgets 前调用
 */
export async function loadGridItems(): Promise<void> {
  const records = await db.gridItems.toArray()
  gridItemsMap.clear()
  for (const record of records) {
    // 剥离数据库字段，保留 UI 所需数据
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...item } = record
    gridItemsMap.set(record.id, item)
  }
  syncList()
}

/**
 * 添加网格项
 * 同步更新内存，异步持久化到数据库
 */
export function addGridItem(item: GridItemUI) {
  gridItemsMap.set(item.id, item)
  syncList()
  db.gridItems.add(toRecord(item))
}

/**
 * 更新网格项
 * 同步更新内存，异步持久化到数据库
 */
export function updateGridItem(item: GridItemUI) {
  gridItemsMap.set(item.id, item)
  syncList()
  // 使用 update 仅更新变更字段，保留 createdAt；剥离运行时 sites 字段
  const data = toPersistedItemData(item)
  db.gridItems.update(item.id, { ...data, updatedAt: Date.now() })
}

/**
 * 删除网格项
 */
export function deleteGridItem(id: string) {
  gridItemsMap.delete(id)
  syncList()
  db.gridItems.delete(id)
}

/**
 * 将站点移入指定文件夹
 */
export function moveSiteToFolder(item: SiteItemUI, folderId: string) {
  const updated: SiteItemUI = { ...item, pid: folderId }
  updateGridItem(updated)
}

/**
 * 获取可用于“移入分组”的文件夹候选列表
 * 仅读取运行时状态，不产生副作用
 */
export function getFolderCandidates(options?: { excludeFolderId?: string }): FolderItemUI[] {
  return Array.from(gridItemsMap.values()).filter(
    (item): item is FolderItemUI => isFolderItem(item) && item.id !== options?.excludeFolderId
  )
}

/**
 * 将站点从文件夹中移出（pid 置为 null）
 */
export function moveSiteItemOutOfFolder(item: SiteItemUI) {
  const updated: SiteItemUI = { ...item, pid: null }
  updateGridItem(updated)
}

/**
 * 批量删除网格项
 * 如果删除项包含文件夹，其子站点也会被一并删除
 */
export function batchDeleteGridItems(ids: string[]) {
  const idsToDelete = new Set(ids)

  // 对于文件夹，收集其下属站点
  for (const id of ids) {
    const item = gridItemsMap.get(id)
    if (item?.type === 'folder') {
      for (const [childId, child] of gridItemsMap) {
        if (isSiteItem(child) && child.pid === id) {
          idsToDelete.add(childId)
        }
      }
    }
  }

  const allIds = Array.from(idsToDelete)
  allIds.forEach((id) => gridItemsMap.delete(id))
  syncList()
  db.gridItems.bulkDelete(allIds)
}
