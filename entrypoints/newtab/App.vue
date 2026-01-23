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
        :class="{ 'bg-white/25': uiStore.isEditMode }"
        title="编辑书签"
        @click="uiStore.toggleEditMode()"
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
      <GridContainer class="w-full max-w-6xl" @open-folder="openFolder" />

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
    <SettingsPanel ref="settingsPanelRef" />

    <!-- 右键菜单 -->
    <ContextMenuRenderer />

    <!-- 文件夹展开模态框 -->
    <FolderModal ref="folderModalRef" />

    <!-- 编辑工具栏 -->
    <EditToolbar />
  </div>

  <SiteEdit ref="siteEditRef" />
  <FolderEdit ref="folderEditRef" />
</template>
<script setup lang="ts">
import { onMounted, computed, ref, provide, useTemplateRef } from 'vue'
import { useGridItemStore } from '@/stores/grid-items'
import { useSettingsStore } from '@/stores/settings'
import { useWallpaperStore } from '@/stores/wallpaper'
import { useUIStore } from '@/stores/ui'
import { useContextMenu } from '@/shadcn/ui/context-menu'
import {
  RefreshCw,
  Pencil,
  Settings as SettingsIcon,
  Plus,
  FolderPlus
} from 'lucide-vue-next'
import { Button } from '@/shadcn/ui/button'

import { SearchBar } from '@/components/search'
import GridContainer from '@/components/grid/grid-container.vue'
import { SettingsPanel } from '@/components/setting'
import { EditToolbar } from '@/components/edit-toolbar'
import { SiteEdit } from '@/components/site'
import { FolderEdit, FolderModal } from '@/components/folder'
import ContextMenuRenderer from '@/shadcn/ui/context-menu/context-menu-renderer.vue'
import { COMPONENTS_DI_KEY } from '@/utils/di'

const gridItemStore = useGridItemStore()
const settingsStore = useSettingsStore()
const wallpaperStore = useWallpaperStore()
const uiStore = useUIStore()
const { show } = useContextMenu()

const siteEditRef = ref<InstanceType<typeof SiteEdit> | null>(null)
const folderEditRef = ref<InstanceType<typeof FolderEdit> | null>(null)
const settingsPanelRef = ref<InstanceType<typeof SettingsPanel> | null>(null)
const folderModalRef = ref<InstanceType<typeof FolderModal> | null>(null)

provide(COMPONENTS_DI_KEY, { siteEdit: siteEditRef, folderEdit: folderEditRef })

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
  await gridItemStore.loadGridItems()

  if (settingsStore.settings.wallpaper.enabled) {
    await wallpaperStore.loadWallpaper()
  }
})

function handleContextMenu(event: MouseEvent) {
  const target = event.target as HTMLElement
  const bookmarkCard = target.closest('.site-item')
  const folderCard = target.closest('.folder-item')

  if (!bookmarkCard && !folderCard) {
    event.preventDefault()
    show({
      x: event.clientX,
      y: event.clientY,
      items: [
        {
          icon: Plus,
          label: '新增网站',
          action: () => siteEditRef.value?.open()
        },
        {
          icon: FolderPlus,
          label: '新增文件夹',
          action: () => folderEditRef.value?.open()
        },
        { type: 'divider' },
        {
          icon: SettingsIcon,
          label: '设置',
          action: () => settingsPanelRef.value?.open()
        }
      ]
    })
  }
}

function openSettingsPanel() {
  settingsPanelRef.value?.open()
}

function openFolder(folderId: string) {
  folderModalRef.value?.open(folderId)
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* 壁纸淡入动画 */
.wallpaper-fade-enter-active {
  transition: opacity 0.3s ease-out;
}

.wallpaper-fade-leave-active {
  transition: opacity 0.3s ease-in;
}

.wallpaper-fade-enter-from,
.wallpaper-fade-leave-to {
  opacity: 0;
}
</style>
