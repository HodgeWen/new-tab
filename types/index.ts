/**
 * 网格尺寸
 */
export interface GridSize {
  w: number
  h: number
}

/** 网格位置 */
export interface GridPosition {
  x: number
  y: number
}

export type FolderSizeName = 'wide' | 'square' | 'narrow'

export type GridItemType = 'site' | 'folder'

/**
 * 网格项的基础接口
 */
export interface BaseGridItem {
  id: string
  type: GridItemType
  title: string
  position: GridPosition
  createdAt: number
  updatedAt: number
}

/**
 * 网站收藏项
 */
export interface SiteItem extends BaseGridItem {
  pid: string | null
  type: 'site'
  url: string
  favicon: string // favicon URL 或 base64
}

/**
 * 文件夹项
 */
export interface FolderItem extends BaseGridItem {
  type: 'folder'
  size: GridSize
}

export type GridItem = SiteItem | FolderItem

export type SiteForm = Pick<SiteItem, 'title' | 'url' | 'favicon' | 'type'> & {
  id: string | null
  pid: string | null
}

export type FolderForm = Pick<FolderItem, 'title' | 'size' | 'type'> & {
  id: string | null
}

export type FolderUIItem = FolderItem & { children: SiteItem[] }

/**
 * WebDAV 配置
 */
export interface WebDAVConfig {
  enabled: boolean
  url: string
  username: string
  password: string // 加密存储
}

/**
 * 壁纸配置
 */
export interface WallpaperConfig {
  enabled: boolean
  interval: number // 轮播间隔（分钟）
  category: string // 分类（仅支持分类的提供者使用）
  source: 'bing' | 'picsum' // 壁纸来源
}

/**
 * 应用设置
 */
export interface Settings {
  showSearchBar: boolean
  webdav: WebDAVConfig
  wallpaper: WallpaperConfig
}

/**
 * 背景图信息
 */
export interface WallpaperInfo {
  id: string
  url: string
  thumbUrl: string
  author: string
  authorUrl: string
  downloadUrl: string
}

export interface BackupData {
  gridItems: GridItem[]
  settings: Settings
  orders: [string, string[]][]
}
