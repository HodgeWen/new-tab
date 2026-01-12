/**
 * 网格位置信息
 */
export interface GridPosition {
  x: number  // 列位置 (0-based)
  y: number  // 行位置 (0-based)
  w: number  // 宽度 (网格单位)
  h: number  // 高度 (网格单位)
}

/**
 * 书签项的基础接口
 */
export interface BookmarkItem {
  id: string
  type: 'site' | 'folder'
  title: string
  order: number
  parentId: string | null // null 表示根级别
  gridPosition?: GridPosition  // 网格位置（可选，用于迁移兼容）
  createdAt: number
  updatedAt: number
}

/**
 * 网站收藏项
 */
export interface SiteItem extends BookmarkItem {
  type: 'site'
  url: string
  favicon: string // favicon URL 或 base64
}

/**
 * 文件夹尺寸类型
 */
export type FolderSize = '1x2' | '2x2' | '2x1'

/**
 * 文件夹项
 */
export interface FolderItem extends BookmarkItem {
  type: 'folder'
  size: FolderSize
  children: string[] // 子项 ID 列表
}


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
  category: string // Unsplash 分类
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

/**
 * 应用持久化状态
 */
export interface AppState {
  bookmarks: Record<string, BookmarkItem>
  rootOrder: string[] // 根级别的排序
  settings: Settings
}

/**
 * 判断是否为网站项
 */
export function isSiteItem(item: BookmarkItem): item is SiteItem {
  return item.type === 'site'
}

/**
 * 判断是否为文件夹项
 */
export function isFolderItem(item: BookmarkItem): item is FolderItem {
  return item.type === 'folder'
}

