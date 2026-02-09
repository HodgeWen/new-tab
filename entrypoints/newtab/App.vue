<template>
  <!-- 壁纸背景 -->
  <transition name="wallpaper-fade">
    <div
      v-if="wallpaperUrl"
      :key="wallpaperUrl"
      class="wallpaper"
      :style="{ backgroundImage: `url(${wallpaperUrl})` }"
    />
  </transition>

  <div class="container">
    <!-- 主内容 -->
    <div class="main" @contextmenu="openGlobalContextmenu">
      <NSearcher v-if="setting.searchBar" @contextmenu.stop />
      <NGridLayout ref="grid-layout" />
    </div>

    <!-- 操作按钮 -->
    <NActions />
  </div>

  <NFolderModal ref="folder-modal" />
  <NSiteModal ref="site-modal" />
  <NSettingModal ref="setting-modal" />
</template>

<script lang="ts" setup>
import { NGridLayout } from '@/components/grid-layout'
import { NFolderModal } from '@/components/folder-modal'
import { NSiteModal } from '@/components/site-modal'
import { NSettingModal } from '@/components/setting-modal'
import { NSearcher } from '@/components/searcher'
import { useTemplateRef } from 'vue'
import { connectComponents } from '@/store/components'
import { NActions } from '@/components/actions'
import { showContextmenu } from '@/components/context-menu'
import { setting } from '@/store/setting'
import { useWallpaper } from '@/hooks/use-wallpaper'

const { wallpaperUrl } = useWallpaper()

const folderModal = useTemplateRef('folder-modal')
const siteModal = useTemplateRef('site-modal')
const settingModal = useTemplateRef('setting-modal')
const gridLayout = useTemplateRef('grid-layout')

connectComponents({ folder: folderModal, site: siteModal, setting: settingModal, gridLayout })

function openGlobalContextmenu(event: MouseEvent) {
  const target = event.target as HTMLElement
  const site = target.closest('.site-item')
  const folder = target.closest('.folder-item')

  if (site || folder) return

  event.preventDefault()
  event.stopPropagation()
  showContextmenu({
    x: event.clientX,
    y: event.clientY,
    items: [
      {
        label: '新增网站',
        action: () => {
          siteModal.value?.open()
        }
      },
      {
        label: '新增文件夹',
        action: () => {
          gridLayout.value?.addWidget({ type: 'folder', title: '新文件夹', size: { w: 2, h: 2 } })
          // folderModal.value?.open()
        }
      }
    ]
  })
}
</script>

<style scoped>
.wallpaper {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.main {
  width: 100%;
  height: 100%;
  padding: 60px 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 隐藏滚动条但允许滚动 */
.main::-webkit-scrollbar {
  display: none;
}
.main {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 壁纸淡入淡出 */
.wallpaper-fade-enter-active {
  transition: opacity 0.8s ease;
}
.wallpaper-fade-leave-active {
  transition: opacity 0.4s ease;
}
.wallpaper-fade-enter-from,
.wallpaper-fade-leave-to {
  opacity: 0;
}
</style>
