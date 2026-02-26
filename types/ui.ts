import type { FolderItem, SiteItem } from './common'

export interface SiteItemUI extends SiteItem {}

export interface FolderItemUI extends FolderItem {
  sites?: SiteItemUI[]
}

export type GridItemUI = SiteItemUI | FolderItemUI

export function isSiteItem(item: GridItemUI): item is SiteItemUI {
  return item.type === 'site'
}

export function isFolderItem(item: GridItemUI): item is FolderItemUI {
  return item.type === 'folder'
}

export type SiteItemForm = Pick<SiteItem, 'type' | 'title' | 'url' | 'icon'> & {
  id?: string | null
  pid: string | null
}

export type FolderItemForm = Pick<FolderItem, 'type' | 'title' | 'size'> & { id?: string | null }
