import { reactive } from 'vue'

import type { UIState } from '@/types/common'

export const ui = reactive<UIState>({ editing: false })

/** 编辑模式下被勾选的 item id 集合 */
export const selectedIds = reactive(new Set<string>())

export function toggleSelect(id: string) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id)
  } else {
    selectedIds.add(id)
  }
}

export function clearSelection() {
  selectedIds.clear()
}

/** 进入编辑模式 */
export function enterEditMode() {
  ui.editing = true
}

/** 退出编辑模式，同时清除选择 */
export function exitEditMode() {
  ui.editing = false
  clearSelection()
}
