import { readonly, ref } from 'vue'

import type { GridItemRecord } from '@/types/db'
import type { FolderItemUI, GridItemUI, SiteItemUI } from '@/types/ui'
import { db } from '@/utils/db'

const _gridItems = ref<GridItemUI[]>([])

/** 响应式的网格项列表（只读） */
export const gridItems = readonly(_gridItems)

/** 网格项 Map，用于快速查找（运行时） */
export const gridItemsMap = new Map<string, GridItemUI>()

/** 同步列表与 Map */
function syncList() {
  _gridItems.value = Array.from(gridItemsMap.values())
}

/** 将 UI 数据转换为数据库记录 */
function toRecord(item: GridItemUI, createdAt?: number): GridItemRecord {
  const now = Date.now()
  return { ...item, createdAt: createdAt ?? now, updatedAt: now } as GridItemRecord
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
    const { createdAt: _, updatedAt: __, ...rest } = record as GridItemRecord & {
      createdAt: number
      updatedAt: number
    }
    gridItemsMap.set(record.id, rest as GridItemUI)
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
  // 使用 update 仅更新变更字段，保留 createdAt
  db.gridItems.update(item.id, { ...item, updatedAt: Date.now() })
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
        if (child.type === 'site' && (child as SiteItemUI).pid === id) {
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
