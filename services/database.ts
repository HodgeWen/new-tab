import Dexie, { type EntityTable } from 'dexie'
import type { BackupData, FolderItem, SiteItem, WallpaperInfo } from '@/types'

/**
 * 网格项数据表记录
 */
export type GridItemRecord = SiteItem | FolderItem

/**
 * 壁纸缓存表记录
 */
interface WallpaperRecord {
  /** 'current' 或 'next' */
  id: 'current' | 'next'
  wallpaper: WallpaperInfo
  blob: Blob
  timestamp: number
}

/**
 * 应用数据库 - 使用 Dexie.js
 *
 * 所有数据统一存储在 IndexedDB 中：
 * - grid_items: 网格项数据
 * - wallpapers: 壁纸缓存（Blob）
 */
class AppDatabase extends Dexie {
  gridItems!: EntityTable<GridItemRecord, 'id'>
  wallpapers!: EntityTable<WallpaperRecord, 'id'>

  constructor() {
    super('new-tab-db')

    this.version(1).stores({ gridItems: 'id', wallpapers: 'id' })
  }
  // ==================== 壁纸缓存操作 ====================

  async getWallpaper(
    id: 'current' | 'next'
  ): Promise<{
    wallpaper: WallpaperInfo
    blobUrl: string
    timestamp: number
  } | null> {
    const record = await this.wallpapers.get(id)
    if (!record) return null

    return {
      wallpaper: record.wallpaper,
      blobUrl: URL.createObjectURL(record.blob),
      timestamp: record.timestamp
    }
  }

  async saveWallpaper(
    id: 'current' | 'next',
    wallpaper: WallpaperInfo,
    blob: Blob
  ): Promise<void> {
    await this.wallpapers.put({ id, wallpaper, blob, timestamp: Date.now() })
  }

  // ==================== 工具方法 ====================

  /**
   * 导出所有数据（不含壁纸 Blob）
   */
  async exportData(): Promise<Pick<BackupData, 'gridItems'>> {
    return { gridItems: await this.gridItems.toArray() }
  }

  /**
   * 导入数据
   */
  async importData(data: BackupData): Promise<boolean> {
    try {
      if (data.gridItems) {
        await this.gridItems.clear()
        await this.gridItems.bulkAdd(data.gridItems)
      }

      return true
    } catch (error) {
      console.error('[Database] Import failed:', error)
      return false
    }
  }
}

// 单例导出
export const db = new AppDatabase()

// 便捷方法：释放 Blob URL
export function revokeObjectUrl(url: string): void {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

// 便捷方法：下载图片为 Blob
export async function fetchImageAsBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.blob()
  } catch (error) {
    console.error('[Database] Failed to fetch image:', error)
    return null
  }
}
