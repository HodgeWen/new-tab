import { readonly, ref } from 'vue'

import type { GridItemUI } from '@/types/ui'

const _gridItems = readonly(ref<GridItemUI[]>([]))
export const gridItemsMap = new Map<string, GridItemUI>()

export const gridItems = readonly(_gridItems)

export function addGridItem(item: GridItemUI) {}

export function updateGridItem(item: GridItemUI) {}

export function deleteGridItem(item: GridItemUI) {}

export function moveSiteItemOutOfFolder(item: GridItemUI) {}
