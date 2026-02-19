<template>
  <a
    class="site-item"
    :class="{ editing: isEditing, selected: isSelected, 'in-folder': inFolder }"
    :href="item.url"
    :title="item.title"
    draggable="false"
    @click="handleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <img v-if="item.icon" class="site-icon" :src="item.icon" :alt="item.title" draggable="false" />
    <span v-else class="site-icon site-icon--fallback">{{ initial }}</span>
    <span class="site-title">{{ item.title }}</span>
    <span v-if="isEditing" class="site-check" :class="{ checked: isSelected }" />
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FolderInput, FolderOutput, Pencil, Trash2 } from 'lucide-vue-next'

import type { ContextmenuItem } from '@/components/context-menu/types'
import type { FolderItemUI, SiteItemUI } from '@/types/ui'

import { showContextmenu } from '@/components/context-menu'
import { components } from '@/store/components'
import {
  deleteGridItem,
  gridItemsMap,
  moveSiteItemOutOfFolder,
  moveSiteToFolder
} from '@/store/grid-items'
import { selectedIds, toggleSelect, ui } from '@/store/ui'

defineOptions({ name: 'NSiteItem' })

const { item, inFolder = false } = defineProps<{ item: SiteItemUI; inFolder?: boolean }>()

/** 仅在 grid-stack 中且处于编辑模式时显示勾选 */
const isEditing = computed(() => ui.editing && !inFolder)
const isSelected = computed(() => selectedIds.has(item.id))
const initial = computed(() => item.title.charAt(0).toUpperCase())

function handleClick(e: MouseEvent) {
  if (isEditing.value) {
    e.preventDefault()
    toggleSelect(item.id)
  }
}

function handleContextMenu(e: MouseEvent) {
  const menuItems: ContextmenuItem<SiteItemUI>[] = []

  // 编辑
  menuItems.push({
    icon: Pencil,
    label: '编辑',
    action: (site) => components.site?.open({ ...site })
  })

  // 移入分组（仅顶层 grid-stack 中）
  if (!inFolder) {
    const folders = Array.from(gridItemsMap.values()).filter(
      (i): i is FolderItemUI => i.type === 'folder'
    )
    if (folders.length > 0) {
      menuItems.push({
        icon: FolderInput,
        label: '移入分组',
        children: folders.map((folder) => ({
          label: folder.title,
          action: (site) => {
            moveSiteToFolder(site, folder.id)
            components.gridLayout?.detachWidget(site.id)
          }
        }))
      })
    }
  }

  // 移出文件夹（仅文件夹内）
  if (inFolder) {
    menuItems.push({
      icon: FolderOutput,
      label: '移出文件夹',
      action: (site) => {
        moveSiteItemOutOfFolder(site)
        components.gridLayout?.attachWidget(site.id)
      }
    })
  }

  // 删除
  menuItems.push({
    icon: Trash2,
    label: '删除',
    action: (site) => {
      if (inFolder) {
        deleteGridItem(site.id)
      } else {
        components.gridLayout?.removeWidget(site.id)
      }
    }
  })

  showContextmenu({ x: e.clientX, y: e.clientY, context: item, items: menuItems })
}
</script>

<style scoped>
.site-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: var(--text-primary);
  border-radius: var(--radius-md);
  position: relative;
  cursor: pointer;
  user-select: none;
  -webkit-user-drag: none;
}

.site-item:active:not(.editing) {
  transform: scale(0.95);
  transition: transform var(--transition-fast);
}

/* 编辑模式 */
.site-item.editing {
  cursor: default;
}

.site-item.selected {
  background: var(--color-primary-subtle);
}

/* 文件夹内：仅图标，居中 */
.site-item.in-folder {
  justify-content: center;
}

/* 网站图标：圆角卡片承载 */
.site-icon {
  width: 54px;
  height: 54px;
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  background: var(--glass-bg-hover);
  object-fit: contain;
  flex-shrink: 0;
  pointer-events: none;
  transition: background var(--transition-fast);
}

.site-item:hover .site-icon {
  background: var(--glass-bg-active);
}

/* 无图标时的文字回退 */
.site-icon--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: var(--text-title);
  font-weight: var(--font-medium);
}

/* 标题（独立于图标，视觉分离） */
.site-title {
  max-width: 100%;
  padding: 0 2px;
  font-size: var(--text-caption);
  line-height: 1;
  text-align: center;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 勾选指示器（CSS-only） */
.site-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--glass-border-strong);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all var(--transition-fast);
}

.site-check.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.site-check.checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 7px;
  border: solid var(--color-on-primary);
  border-width: 0 1.5px 1.5px 0;
  transform: translate(-50%, -60%) rotate(45deg);
}
</style>
