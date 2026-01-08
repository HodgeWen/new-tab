import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BookmarkItem, SiteItem, FolderItem } from '@/types'

export type ContextMenuTarget = 'blank' | 'site' | 'folder'
export type ModalType = 'addSite' | 'editSite' | 'addFolder' | 'editFolder' | 'settings' | 'folder' | null

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  target: ContextMenuTarget
  targetItem: BookmarkItem | null
}

export const useUIStore = defineStore('ui', () => {
  // 右键菜单状态
  const contextMenu = ref<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    target: 'blank',
    targetItem: null,
  })

  // 模态框状态
  const modalType = ref<ModalType>(null)
  const modalData = ref<BookmarkItem | null>(null)

  // 当前展开的文件夹
  const openFolderId = ref<string | null>(null)

  // 设置面板是否打开
  const settingsPanelOpen = ref(false)

  // 编辑中的项目
  const editingItem = ref<SiteItem | FolderItem | null>(null)

  // 编辑模式状态
  const isEditMode = ref(false)
  const selectedIds = ref<Set<string>>(new Set())

  const isContextMenuVisible = computed(() => contextMenu.value.visible)

  function openContextMenu(x: number, y: number, target: ContextMenuTarget, item: BookmarkItem | null = null) {
    contextMenu.value = {
      visible: true,
      x,
      y,
      target,
      targetItem: item,
    }
  }

  function closeContextMenu() {
    contextMenu.value.visible = false
    contextMenu.value.targetItem = null
  }

  function openModal(type: ModalType, data: BookmarkItem | null = null) {
    modalType.value = type
    modalData.value = data
  }

  function closeModal() {
    modalType.value = null
    modalData.value = null
    editingItem.value = null
  }

  function openFolder(folderId: string) {
    openFolderId.value = folderId
  }

  function closeFolder() {
    openFolderId.value = null
  }

  function toggleSettingsPanel() {
    settingsPanelOpen.value = !settingsPanelOpen.value
  }

  function openSettingsPanel() {
    settingsPanelOpen.value = true
  }

  function closeSettingsPanel() {
    settingsPanelOpen.value = false
  }

  function setEditingItem(item: SiteItem | FolderItem | null) {
    editingItem.value = item
  }

  // 编辑模式相关函数
  function enterEditMode() {
    isEditMode.value = true
    selectedIds.value = new Set()
  }

  function exitEditMode() {
    isEditMode.value = false
    selectedIds.value = new Set()
  }

  function toggleEditMode() {
    if (isEditMode.value) {
      exitEditMode()
    } else {
      enterEditMode()
    }
  }

  function toggleSelectItem(id: string) {
    const newSet = new Set(selectedIds.value)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    selectedIds.value = newSet
  }

  function selectItem(id: string) {
    const newSet = new Set(selectedIds.value)
    newSet.add(id)
    selectedIds.value = newSet
  }

  function unselectItem(id: string) {
    const newSet = new Set(selectedIds.value)
    newSet.delete(id)
    selectedIds.value = newSet
  }

  function selectAll(ids: string[]) {
    selectedIds.value = new Set(ids)
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  function isSelected(id: string): boolean {
    return selectedIds.value.has(id)
  }

  const selectedCount = computed(() => selectedIds.value.size)

  return {
    contextMenu,
    modalType,
    modalData,
    openFolderId,
    settingsPanelOpen,
    editingItem,
    isContextMenuVisible,
    isEditMode,
    selectedIds,
    selectedCount,
    openContextMenu,
    closeContextMenu,
    openModal,
    closeModal,
    openFolder,
    closeFolder,
    toggleSettingsPanel,
    openSettingsPanel,
    closeSettingsPanel,
    setEditingItem,
    enterEditMode,
    exitEditMode,
    toggleEditMode,
    toggleSelectItem,
    selectItem,
    unselectItem,
    selectAll,
    clearSelection,
    isSelected,
  }
})

