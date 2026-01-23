import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useGridItemStore } from './grid-items'
import { isSiteItem } from '@/types'

export const useUIStore = defineStore('ui', () => {
  const gridItemStore = useGridItemStore()
  /** 是否编辑状态 */
  const isEditMode = ref(false)

  /** 选中的网站ID集合 */
  const checkedSites = ref<Set<string>>(new Set())

  const selectedCount = computed(() => checkedSites.value.size)

  const rootSites = computed(() => {
    return gridItemStore.rootGridItems.filter(isSiteItem)
  })

  const isAllSitesChecked = computed(() => {
    return checkedSites.value.size === rootSites.value.length
  })

  function toggleCheckSite(id: string) {
    if (checkedSites.value.has(id)) {
      checkedSites.value.delete(id)
    } else {
      checkedSites.value.add(id)
    }
  }

  function toggleCheckAllSites() {
    if (isAllSitesChecked.value) {
      checkedSites.value = new Set()
    } else {
      checkedSites.value = new Set(rootSites.value.map(site => site.id))
    }
  }

  function selectAll(ids: string[]) {
    checkedSites.value = new Set(ids)
  }

  function clearSelection() {
    checkedSites.value = new Set()
  }

  function isSelected(id: string) {
    return checkedSites.value.has(id)
  }

  function enterEditMode() {
    isEditMode.value = true
    clearSelection()
  }

  function exitEditMode() {
    isEditMode.value = false
    clearSelection()
  }

  function toggleEditMode() {
    if (isEditMode.value) {
      exitEditMode()
    } else {
      enterEditMode()
    }
  }

  return {
    isEditMode,
    checkedSites,
    isAllSitesChecked,
    selectedCount,
    toggleCheckSite,
    toggleCheckAllSites,
    selectAll,
    clearSelection,
    isSelected,
    enterEditMode,
    exitEditMode,
    toggleEditMode
  }
})
