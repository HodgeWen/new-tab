import Dexie, { type EntityTable } from 'dexie'
import type { GridItem, WallpaperInfo } from '@/types'

/**
 * 网格项数据表记录
 */
interface GridItemRecord extends GridItem {}

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
 * Favicon 缓存表记录
 */
interface FaviconRecord {
  /** 网站域名作为主键 */
  id: string
  /** 网站 ID (可选) */
  siteId?: string
  /** Base64 图标数据 */
  dataUrl: string
  /** 缓存时间戳 */
  timestamp: number
}

/**
 * 应用数据库 - 使用 Dexie.js
 *
 * 所有数据统一存储在 IndexedDB 中：
 * - grid_items: 网格项数据
 * - wallpapers: 壁纸缓存（Blob）
 * - favicons: 网站图标缓存
 */
class AppDatabase extends Dexie {
  gridItems!: EntityTable<GridItemRecord, 'id'>
  favicons!: EntityTable<FaviconRecord, 'id'>
  wallpapers!: EntityTable<WallpaperRecord, 'id'>

  constructor() {
    super('new-tab-db')

    this.version(1).stores({
      gridItems: 'id',
      wallpapers: 'id',
      favicons: 'id'
    })
  }

  // ==================== 网格项操作 ====================

  async getGridItems(): Promise<GridItemRecord[]> {
    return this.gridItems.toArray()
  }

  async saveGridItems(gridItems: GridItemRecord[]): Promise<void> {
    await this.gridItems.bulkPut(gridItems)
  }

  async clearGridItems(): Promise<void> {
    await this.gridItems.clear()
  }

  // ==================== 壁纸缓存操作 ====================

  async getWallpaper(id: 'current' | 'next'): Promise<{
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
    await this.wallpapers.put({
      id,
      wallpaper,
      blob,
      timestamp: Date.now()
    })
  }

  // ==================== Favicon 缓存操作 ====================

  /**
   * 获取缓存的 favicon
   * @param domain 网站域名
   * @returns favicon 的 Base64 数据，如果不存在则返回 null
   */
  async getFavicon(domain: string): Promise<string | null> {
    try {
      const record = await this.favicons.get(domain)
      return record?.dataUrl ?? null
    } catch (error) {
      console.error('[Database] getFavicon error:', error)
      return null
    }
  }

  /**
   * 保存 favicon 到缓存
   * @param domain 网站域名
   * @param dataUrl Base64 格式的图标数据
   */
  async saveFavicon(domain: string, dataUrl: string): Promise<void> {
    try {
      await this.favicons.put({
        id: domain,
        dataUrl,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('[Database] saveFavicon error:', error)
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 导出所有数据（不含壁纸 Blob）
   */
  async exportData(): Promise<string> {
    const gridItemsData = await this.getGridItems()

    return JSON.stringify(
      {
        gridItems: gridItemsData,
        exportedAt: new Date().toISOString(),
        version: '2.0.0'
      },
      null,
      2
    )
  }

  /**
   * 导入数据
   */
  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString)

      if (data.gridItems) {
        await this.clearGridItems()
        await this.saveGridItems(data.gridItems)
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
