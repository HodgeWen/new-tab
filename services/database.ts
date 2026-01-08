import Dexie, { type EntityTable } from 'dexie'
import type { BookmarkItem, Settings, WallpaperInfo } from '@/types'

/**
 * 书签数据表记录
 */
interface BookmarkRecord {
  /** 固定 ID，只有一条记录 */
  id: 'data'
  bookmarks: Record<string, BookmarkItem>
  rootOrder: string[]
  updatedAt: number
}

/**
 * 设置数据表记录
 */
interface SettingsRecord {
  /** 固定 ID，只有一条记录 */
  id: 'data'
  settings: Settings
  updatedAt: number
}

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
 * WebDAV 配置表记录（加密存储密码）
 */
interface WebDAVRecord {
  id: 'config'
  url: string
  username: string
  encryptedPassword: string
  updatedAt: number
}

/**
 * 应用数据库 - 使用 Dexie.js
 *
 * 所有数据统一存储在 IndexedDB 中：
 * - bookmarks: 书签数据
 * - settings: 应用设置
 * - wallpapers: 壁纸缓存（Blob）
 * - webdav: WebDAV 配置
 */
class AppDatabase extends Dexie {
  bookmarks!: EntityTable<BookmarkRecord, 'id'>
  settings!: EntityTable<SettingsRecord, 'id'>
  wallpapers!: EntityTable<WallpaperRecord, 'id'>
  webdav!: EntityTable<WebDAVRecord, 'id'>

  constructor() {
    super('new-tab-db')

    this.version(1).stores({
      bookmarks: 'id',
      settings: 'id',
      wallpapers: 'id',
      webdav: 'id'
    })
  }

  // ==================== 书签操作 ====================

  async getBookmarks(): Promise<{
    bookmarks: Record<string, BookmarkItem>
    rootOrder: string[]
  }> {
    const record = await this.bookmarks.get('data')
    return {
      bookmarks: record?.bookmarks || {},
      rootOrder: record?.rootOrder || []
    }
  }

  async saveBookmarks(
    bookmarks: Record<string, BookmarkItem>,
    rootOrder: string[]
  ): Promise<void> {
    await this.bookmarks.put({
      id: 'data',
      bookmarks,
      rootOrder,
      updatedAt: Date.now()
    })
  }

  // ==================== 设置操作 ====================

  async getSettings(): Promise<Settings | null> {
    try {
      const record = await this.settings.get('data')
      return record?.settings ?? null
    } catch (error) {
      console.error('[Database] getSettings error:', error)
      return null
    }
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      await this.settings.put({
        id: 'data',
        settings,
        updatedAt: Date.now()
      })
      console.log('[Database] saveSettings success')
    } catch (error) {
      console.error('[Database] saveSettings error:', error)
      throw error
    }
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

  async clearWallpaperCache(): Promise<void> {
    await this.wallpapers.clear()
  }

  async getWallpaperCacheSize(): Promise<number> {
    const records = await this.wallpapers.toArray()
    return records.reduce((total, record) => total + record.blob.size, 0)
  }

  // ==================== WebDAV 配置操作 ====================

  async getWebDAVConfig(): Promise<{
    url: string
    username: string
    encryptedPassword: string
  } | null> {
    const record = await this.webdav.get('config')
    if (!record) return null

    return {
      url: record.url,
      username: record.username,
      encryptedPassword: record.encryptedPassword
    }
  }

  async saveWebDAVConfig(
    url: string,
    username: string,
    encryptedPassword: string
  ): Promise<void> {
    await this.webdav.put({
      id: 'config',
      url,
      username,
      encryptedPassword,
      updatedAt: Date.now()
    })
  }

  async clearWebDAVConfig(): Promise<void> {
    await this.webdav.delete('config')
  }

  // ==================== 工具方法 ====================

  /**
   * 获取数据库使用量（估算）
   */
  async getStorageUsage(): Promise<{
    used: number
    quota: number
    percentage: number
  }> {
    try {
      // 使用 Storage API 估算（如果可用）
      if (navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate()
        const used = estimate.usage || 0
        const quota = estimate.quota || 0
        return {
          used,
          quota,
          percentage: quota > 0 ? (used / quota) * 100 : 0
        }
      }

      // 回退：手动计算
      const [bookmarks, settings, wallpapers] = await Promise.all([
        this.bookmarks.toArray(),
        this.settings.toArray(),
        this.wallpapers.toArray()
      ])

      const bookmarksSize = JSON.stringify(bookmarks).length
      const settingsSize = JSON.stringify(settings).length
      const wallpapersSize = wallpapers.reduce((sum, w) => sum + w.blob.size, 0)
      const used = bookmarksSize + settingsSize + wallpapersSize

      // 假设 100MB 配额
      const quota = 100 * 1024 * 1024
      return {
        used,
        quota,
        percentage: (used / quota) * 100
      }
    } catch {
      return { used: 0, quota: 0, percentage: 0 }
    }
  }

  /**
   * 导出所有数据（不含壁纸 Blob）
   */
  async exportData(): Promise<string> {
    const [bookmarksData, settingsData] = await Promise.all([
      this.getBookmarks(),
      this.getSettings()
    ])

    return JSON.stringify(
      {
        bookmarks: bookmarksData,
        settings: settingsData,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
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

      if (data.bookmarks) {
        await this.saveBookmarks(
          data.bookmarks.bookmarks || data.bookmarks,
          data.bookmarks.rootOrder || []
        )
      }

      if (data.settings) {
        await this.saveSettings(data.settings)
      }

      return true
    } catch (error) {
      console.error('[Database] Import failed:', error)
      return false
    }
  }

  /**
   * 清除所有数据
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.bookmarks.clear(),
      this.settings.clear(),
      this.wallpapers.clear(),
      this.webdav.clear()
    ])
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
