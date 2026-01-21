import Dexie, { type EntityTable } from 'dexie'
import type { GridItem, Settings, WallpaperInfo } from '@/types'

/**
 * 网格项数据表记录
 */
interface GridItemRecord extends GridItem {}

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
 * Favicon 缓存表记录
 */
interface FaviconRecord {
  /** 网站域名作为主键 */
  id: string
  /** 网站 ID */
  siteId: string
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
 * - settings: 应用设置
 * - wallpapers: 壁纸缓存（Blob）
 * - webdav: WebDAV 配置
 * - favicons: 网站图标缓存
 */
class AppDatabase extends Dexie {
  gridItems!: EntityTable<GridItemRecord, 'id'>
  settings!: EntityTable<SettingsRecord, 'id'>
  favicons!: EntityTable<FaviconRecord, 'id'>
  wallpapers!: EntityTable<WallpaperRecord, 'id'>
  webdav!: EntityTable<WebDAVRecord, 'id'>

  constructor() {
    super('new-tab-db')

    this.version(1).stores({
      gridItems: 'id',
      settings: 'id',
      wallpapers: 'id',
      webdav: 'id',
      favicons: 'id'
    })
  }

  // ==================== 网格项操作 ====================

  async getGridItems(): Promise<GridItemRecord[]> {
    return this.gridItems.toArray()
  }

  async saveGridItems(gridItems: GridItemRecord[]): Promise<void> {}

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
        domain,
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
    const [bookmarksData, settingsData] = await Promise.all([
      this.getBookmarks(),
      this.getSettings()
    ])

    return JSON.stringify(
      {
        bookmarks: bookmarksData,
        settings: settingsData,
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
