import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useGridItemStore } from './grid-items'

export const useUIStore = defineStore('ui', () => {
  const gridItemStore = useGridItemStore()
  /** 是否编辑状态 */
  const isEditMode = ref(false)

  /** 选中的网站ID集合 */
  const checkedSites = ref<Set<string>>(new Set())

  const selectedCount = computed(() => checkedSites.value.size)

  const rootSites = computed(() => {
    return gridItemStore.items.filter(item => item.type === 'site')
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

  function toggleEditMode(edit?: boolean) {
    if (edit !== undefined) {
      isEditMode.value = edit
    } else {
      isEditMode.value = !isEditMode.value
    }
  }

  function clear() {
    checkedSites.value = new Set()
  }

  return {
    isEditMode,
    checkedSites,
    isAllSitesChecked,
    selectedCount,
    toggleCheckSite,
    toggleCheckAllSites,
    toggleEditMode,
    clear
  }
})
