<template>
  <div class="container" @contextmenu="handleContextmenu">
    <!-- 主内容 -->
    <div class="main">
      <NGridLayout />
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
import { useTemplateRef } from 'vue'
import { connectModals } from '@/store/modals'
import { NActions } from '@/components/actions'
import { showContextmenu } from '@/components/context-menu'

const folderModal = useTemplateRef('folder-modal')
const siteModal = useTemplateRef('site-modal')
const settingModal = useTemplateRef('setting-modal')

connectModals({ folder: folderModal, site: siteModal, setting: settingModal })

function handleContextmenu(event: MouseEvent) {
  const target = event.target as HTMLElement
  const site = target.closest('.site-item')
  const folder = target.closest('.folder-item')

  if (site || folder) return

  event.preventDefault()
  event.stopPropagation()
  showContextmenu({ x: event.clientX, y: event.clientY, items: [] })
}
</script>
