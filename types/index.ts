/**
 * 网格尺寸
 */
export interface GridSize {
  w: number
  h: number
}

/**
 * 网格位置信息
 */
export interface GridPosition extends GridSize {
  x?: number
  y?: number
}

/**
 * 预设文件夹尺寸配置
 */
export const FOLDER_SIZE_PRESETS = {
  narrow: { w: 1, h: 2, label: '1×2', desc: '窄高型' },
  square: { w: 2, h: 2, label: '2×2', desc: '正方形' },
  wide: { w: 2, h: 1, label: '2×1', desc: '宽扁型' }
} as const

export type FolderSizePreset = keyof typeof FOLDER_SIZE_PRESETS

/**
 * 网格项的基础接口
 */
export interface GridItem {
  id: string
  type: string
  title: string
  order: number
  pid: string | null
  position: GridPosition
  createdAt: number
  updatedAt: number
}

/**
 * 网站收藏项
 */
export interface SiteItem extends GridItem {
  type: 'site'
  url: string
  favicon: string // favicon URL 或 base64
}

/**
 * 文件夹项
 */
export interface FolderItem extends GridItem {
  type: 'folder'
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

/**
 * 判断是否为网站项
 */
export function isSiteItem(item: GridItem): item is SiteItem {
  return item.type === 'site'
}

/**
 * 判断是否为文件夹项
 */
export function isFolderItem(item: GridItem): item is FolderItem {
  return item.type === 'folder'
}
