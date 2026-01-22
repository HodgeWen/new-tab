import type { InjectionKey, Ref, ComputedRef } from 'vue'
import type { GridItem, SiteItem, FolderItem } from './index'

export type ContextMenuTarget = 'blank' | 'site' | 'folder'

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  target: ContextMenuTarget
  targetItem: GridItem | null
}

export type ModalType =
  | 'addSite'
  | 'editSite'
  | 'addFolder'
  | 'editFolder'
  | 'settings'
  | 'folder'
  | null

export interface UIContext {
  // State
  contextMenu: Ref<ContextMenuState>
  modalType: Ref<ModalType>
  modalData: Ref<GridItem | null>
  openFolderId: Ref<string | null>
  settingsPanelOpen: Ref<boolean>
  editingItem: Ref<SiteItem | FolderItem | null>
  isEditMode: Ref<boolean>
  selectedIds: Ref<Set<string>>
  selectedCount: ComputedRef<number>

  // Actions
  openContextMenu: (x: number, y: number, target: ContextMenuTarget, item?: GridItem | null) => void
  closeContextMenu: () => void
  openModal: (type: ModalType, data?: GridItem | null) => void
  closeModal: () => void
  openFolder: (folderId: string) => void
  closeFolder: () => void
  openSettingsPanel: () => void
  closeSettingsPanel: () => void
  setEditingItem: (item: SiteItem | FolderItem | null) => void
  enterEditMode: () => void
  exitEditMode: () => void
  toggleEditMode: () => void
  toggleSelectItem: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
}

export const UI_KEY: InjectionKey<UIContext> = Symbol('UI')
