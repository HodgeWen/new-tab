import type { FolderItem, SiteItem } from './common'

export interface SiteItemUI extends SiteItem {}

export interface FolderItemUI extends FolderItem {
  sites: SiteItemUI[]
}

export type GridItemUI = SiteItemUI | FolderItemUI
