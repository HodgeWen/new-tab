import type { FolderItem, SiteItem, WallpaperInfo } from './common'

export interface SiteItemRecord extends SiteItem {
  updatedAt: number
  createdAt: number
}

export interface FolderItemRecord extends FolderItem {
  updatedAt: number
  createdAt: number
}

export type GridItemRecord = SiteItemRecord | FolderItemRecord

export interface WallpaperRecord {
  /** 'current' 或 'next' */
  id: 'current' | 'next'
  wallpaper: WallpaperInfo
  blob: Blob
  timestamp: number
}

export interface BackupData {
  gridItems: GridItemRecord[]
  wallpapers: WallpaperRecord[]
  /** Optional: grid order (IDs); from localStorage, preserved for restore */
  gridOrder?: string[]
}
