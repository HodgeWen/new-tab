<script setup lang="ts">
import { onMounted, computed, ref, provide } from 'vue'
import { useGridItemStore } from '@/stores/grid-items'
import { useSettingsStore } from '@/stores/settings'
import { useWallpaperStore } from '@/stores/wallpaper'
import { UI_KEY, type UIContext, type ContextMenuState, type ModalType, type ContextMenuTarget } from '@/types/ui'
import type { GridItem, SiteItem, FolderItem } from '@/types'
import { RefreshCw, Pencil, Settings as SettingsIcon } from 'lucide-vue-next'
import { Button } from '@/shadcn/ui/button'

import SearchBar from '@/components/SearchBar.vue'
import TabGrid from '@/components/TabGrid.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import FolderModal from '@/components/FolderModal.vue'
import AddSiteModal from '@/components/AddSiteModal.vue'
import AddFolderModal from '@/components/AddFolderModal.vue'
import EditToolbar from '@/components/EditToolbar.vue'

const gridItemStore = useGridItemStore()
const settingsStore = useSettingsStore()
const wallpaperStore = useWallpaperStore()

// UI State Implementation
const contextMenu = ref<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
  target: 'blank',
  targetItem: null
})

const modalType = ref<ModalType>(null)
const modalData = ref<GridItem | null>(null)
const openFolderId = ref<string | null>(null)
const settingsPanelOpen = ref(false)
const editingItem = ref<SiteItem | FolderItem | null>(null)
const isEditMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())

const selectedCount = computed(() => selectedIds.value.size)

// Actions
function openContextMenu(x: number, y: number, target: ContextMenuTarget, item: GridItem | null = null) {
  contextMenu.value = {
    visible: true,
    x,
    y,
    target,
    targetItem: item
  }
}

function closeContextMenu() {
  contextMenu.value.visible = false
  contextMenu.value.targetItem = null
}

function openModal(type: ModalType, data: GridItem | null = null) {
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

function openSettingsPanel() {
  settingsPanelOpen.value = true
}

function closeSettingsPanel() {
  settingsPanelOpen.value = false
}

function setEditingItem(item: SiteItem | FolderItem | null) {
  editingItem.value = item
}

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

function selectAll(ids: string[]) {
  selectedIds.value = new Set(ids)
}

function clearSelection() {
  selectedIds.value = new Set()
}

function isSelected(id: string): boolean {
  return selectedIds.value.has(id)
}

// Provide UI Context
const uiContext: UIContext = {
  contextMenu,
  modalType,
  modalData,
  openFolderId,
  settingsPanelOpen,
  editingItem,
  isEditMode,
  selectedIds,
  selectedCount,
  openContextMenu,
  closeContextMenu,
  openModal,
  closeModal,
  openFolder,
  closeFolder,
  openSettingsPanel,
  closeSettingsPanel,
  setEditingItem,
  enterEditMode,
  exitEditMode,
  toggleEditMode,
  toggleSelectItem,
  selectAll,
  clearSelection,
  isSelected
}

provide(UI_KEY, uiContext)

// 默认深色渐变背景（始终显示在最底层）
const defaultGradient =
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'

// 壁纸背景样式
const wallpaperStyle = computed(() => {
  if (
    !settingsStore.settings.wallpaper.enabled ||
    !wallpaperStore.currentWallpaperUrl
  ) {
    return null
  }
  return {
    backgroundImage: `url(${wallpaperStore.currentWallpaperUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

// 壁纸是否准备好显示
const showWallpaper = computed(() => {
  return (
    settingsStore.settings.wallpaper.enabled &&
    wallpaperStore.isReady &&
    wallpaperStore.currentWallpaperUrl
  )
})

onMounted(async () => {
  await Promise.all([
    gridItemStore.loadGridItems(),
    settingsStore.loadSettings()
  ])

  if (settingsStore.settings.wallpaper.enabled) {
    await wallpaperStore.loadWallpaper()
  }
})

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()

  const target = event.target as HTMLElement
  const bookmarkCard = target.closest('.bookmark-card')
  const folderCard = target.closest('.folder-card')

  if (!bookmarkCard && !folderCard) {
    openContextMenu(event.clientX, event.clientY, 'blank')
  }
}
</script>

<template>
  <div
    id="app"
    class="min-h-screen w-full overflow-hidden relative font-sans"
    @contextmenu="handleContextMenu"
  >
    <!-- 底层：默认深色渐变背景（始终可见） -->
    <div class="absolute inset-0" :style="{ background: defaultGradient }" />

    <!-- 壁纸层：带淡入动画 -->
    <Transition name="wallpaper-fade">
      <div
        v-if="showWallpaper"
        class="absolute inset-0"
        :style="wallpaperStyle"
      />
    </Transition>

    <!-- 背景遮罩层 -->
    <div class="absolute inset-0 bg-black/30" />

    <!-- 右上角按钮组 -->
    <div class="fixed top-4 right-4 z-20 flex items-center gap-2">
      <!-- 换壁纸按钮（仅在壁纸启用时显示） -->
      <Button
        v-if="settingsStore.settings.wallpaper.enabled"
        variant="glass"
        size="icon"
        title="换一张壁纸"
        :disabled="wallpaperStore.loading"
        @click="wallpaperStore.switchToNext()"
      >
        <RefreshCw
          class="size-5"
          :class="{ 'animate-spin': wallpaperStore.loading }"
        />
      </Button>

      <!-- 编辑按钮 -->
      <Button
        variant="glass"
        size="icon"
        :class="{ 'bg-white/25': isEditMode }"
        title="编辑书签"
        @click="toggleEditMode()"
      >
        <Pencil class="size-5" />
      </Button>

      <!-- 设置按钮 -->
      <Button
        variant="glass"
        size="icon"
        title="设置"
        @click="openSettingsPanel()"
      >
        <SettingsIcon class="size-5" />
      </Button>
    </div>

    <!-- 主内容区域 -->
    <div
      class="relative z-10 min-h-screen flex flex-col items-center pt-[15vh] px-4"
    >
      <!-- 搜索栏 -->
      <SearchBar v-if="settingsStore.settings.showSearchBar" class="mb-12" />

      <!-- 网格布局 -->
      <TabGrid class="w-full max-w-6xl" />

      <!-- 壁纸信息 -->
      <div
        v-if="
          wallpaperStore.currentWallpaper &&
          settingsStore.settings.wallpaper.enabled
        "
        class="fixed bottom-4 right-4 text-white/60 text-xs"
      >
        Photo by
        <a
          :href="wallpaperStore.currentWallpaper.authorUrl"
          target="_blank"
          class="hover:text-white/90 underline"
        >
          {{ wallpaperStore.currentWallpaper.author }}
        </a>
        on Picsum
      </div>
    </div>

    <!-- 设置面板 -->
    <SettingsPanel />

    <!-- 右键菜单 -->
    <ContextMenu />

    <!-- 文件夹展开模态框 -->
    <FolderModal />

    <!-- 添加/编辑网站模态框 -->
    <AddSiteModal />

    <!-- 添加/编辑文件夹模态框 -->
    <AddFolderModal />

    <!-- 编辑工具栏 -->
    <EditToolbar />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* 壁纸淡入动画 */
.wallpaper-fade-enter-active {
  transition: opacity 0.6s ease-out;
}

.wallpaper-fade-leave-active {
  transition: opacity 0.3s ease-in;
}

.wallpaper-fade-enter-from,
.wallpaper-fade-leave-to {
  opacity: 0;
}
</style>
