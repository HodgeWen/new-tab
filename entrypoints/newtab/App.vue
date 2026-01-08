<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useSettingsStore } from '@/stores/settings'
import { useWallpaperStore } from '@/stores/wallpaper'
import { useUIStore } from '@/stores/ui'

import SearchBar from '@/components/SearchBar.vue'
import BookmarkGrid from '@/components/BookmarkGrid.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import FolderModal from '@/components/FolderModal.vue'
import AddSiteModal from '@/components/AddSiteModal.vue'
import AddFolderModal from '@/components/AddFolderModal.vue'
import EditToolbar from '@/components/EditToolbar.vue'

const bookmarkStore = useBookmarkStore()
const settingsStore = useSettingsStore()
const wallpaperStore = useWallpaperStore()
const uiStore = useUIStore()

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
    bookmarkStore.loadBookmarks(),
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
    uiStore.openContextMenu(event.clientX, event.clientY, 'blank')
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
      <button
        v-if="settingsStore.settings.wallpaper.enabled"
        class="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 group"
        title="换一张壁纸"
        :disabled="wallpaperStore.loading"
        @click="wallpaperStore.switchToNext()"
      >
        <div
          class="i-lucide-refresh-cw w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300"
          :class="{ 'animate-spin': wallpaperStore.loading }"
        />
      </button>

      <!-- 编辑按钮 -->
      <button
        class="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 group"
        :class="{ 'bg-white/25': uiStore.isEditMode }"
        title="编辑书签"
        @click="uiStore.toggleEditMode()"
      >
        <div
          class="i-lucide-pencil w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300"
          :class="{ 'text-white': uiStore.isEditMode }"
        />
      </button>

      <!-- 设置按钮 -->
      <button
        class="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 group"
        title="设置"
        @click="uiStore.openSettingsPanel()"
      >
        <div
          class="i-lucide-settings w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300"
        />
      </button>
    </div>

    <!-- 主内容区域 -->
    <div
      class="relative z-10 min-h-screen flex flex-col items-center pt-[15vh] px-4"
    >
      <!-- 搜索栏 -->
      <SearchBar v-if="settingsStore.settings.showSearchBar" class="mb-12" />

      <!-- 书签网格 -->
      <BookmarkGrid class="w-full max-w-6xl" />

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
