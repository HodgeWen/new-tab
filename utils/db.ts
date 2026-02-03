import Dexie, { type EntityTable } from 'dexie'

import type { WallpaperInfo } from '@/types/common'
import type { GridItemRecord, WallpaperRecord } from '@/types/db'

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
  ): Promise<{ wallpaper: WallpaperInfo; blobUrl: string; timestamp: number } | null> {
    const record = await this.wallpapers.get(id)
    if (!record) return null

    return {
      wallpaper: record.wallpaper,
      blobUrl: URL.createObjectURL(record.blob),
      timestamp: record.timestamp
    }
  }

  async saveWallpaper(id: 'current' | 'next', wallpaper: WallpaperInfo, blob: Blob): Promise<void> {
    await this.wallpapers.put({ id, wallpaper, blob, timestamp: Date.now() })
  }
}

// 单例导出
export const db = new AppDatabase()
