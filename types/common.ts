export interface ItemSize {
  w: number
  h: number
}

export interface ItemPosition {
  x: number
  y: number
}

export type ItemType = 'folder' | 'site'

export interface GridItem {
  type: ItemType
  id: string
  position: ItemPosition
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
  size: ItemSize
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
