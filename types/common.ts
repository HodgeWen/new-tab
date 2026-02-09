export type ItemType = 'folder' | 'site'

/**
 * 文件夹尺寸预设
 * - 'horizontal': 2x1 (横向)
 * - 'vertical': 1x2 (纵向)
 * - 'square': 2x2 (方形)
 */
export type FolderSize = 'horizontal' | 'vertical' | 'square'

export interface GridItem {
  type: ItemType
  id: string
  title: string
}

export interface SiteItem extends GridItem {
  pid: string | null
  type: 'site'
  url: string
  /**
   * 图标, 是 base64 编码的图片
   */
  icon: string
}

export interface FolderItem extends GridItem {
  type: 'folder'
  size: FolderSize
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

export interface Setting {
  /**
   * 是否显示搜索栏
   */
  searchBar: boolean
  /**
   * 是否启用壁纸
   */
  wallpaper: boolean
  /**
   * 壁纸提供者
   */
  wallpaperProvider: string
  /**
   * 壁纸轮播间隔
   */

  wallpaperInterval: number
  /**
   * WebDAV 配置
   */
  webdav: { url: string; username: string; password: string }
}

export interface UIState {
  /**
   * 是否处于编辑模式
   */
  editing: boolean
}

export interface WallpaperRequestOptions {
  force?: boolean
  excludeId?: string
}

export interface WallpaperProvider {
  name: string
  id: string
  refreshable: boolean
  getWallpaper: (options?: WallpaperRequestOptions) => Promise<WallpaperInfo>
}
