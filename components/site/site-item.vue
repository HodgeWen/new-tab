<template>
  <div
    class="site-item group flex flex-col items-center cursor-pointer select-none relative"
    :class="{ 'edit-mode': uiStore.isEditMode }"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <!-- 编辑模式选中标记（仅非 preview 模式） -->
    <div
      v-if="!preview && uiStore.isEditMode"
      class="absolute -top-1 -right-1 z-10 size-5 rounded-full flex items-center justify-center"
      :class="
        isSelected
          ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
          : 'bg-white/20 border border-white/30'
      "
    >
      <Check v-if="isSelected" class="size-3 text-white" />
    </div>

    <!-- 图标容器 -->
    <div
      class="rounded-2xl glass flex items-center justify-center"
      :class="[
        preview ? 'hover:bg-white/10' : 'glass-hover',
        !preview && uiStore.isEditMode
          ? isSelected
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent scale-95'
            : 'opacity-80 hover:opacity-100'
          : ''
      ]"
    >
      <img
        :src="faviconUrl"
        :alt="item.title"
        class="rounded-lg object-contain"
      />
    </div>

    <!-- 标题（仅非 preview 模式） -->
    <span
      v-if="!preview"
      class="text-xs text-center line-clamp-2 max-w-[72px] text-shadow mt-2"
      :class="isSelected ? 'text-white' : 'text-white/80'"
    >
      {{ item.title }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { SiteItem } from '@/types'
import { faviconService } from '@/services/favicon'
import { useGridItemStore } from '@/stores/grid-items'
import { useUIStore } from '@/stores/ui'
import { ContextmenuItem, showContextmenu } from '@/shadcn/ui/context-menu'
import { COMPONENTS_DI_KEY, type ComponentsDI } from '@/utils/di'
import {
  Check,
  FolderInput,
  FolderOutput,
  Pencil,
  Trash2
} from 'lucide-vue-next'

defineOptions({ name: 'SiteItem' })

const props = defineProps<{
  item: SiteItem
  preview?: boolean
  components?: ComponentsDI
}>()

const gridItemStore = useGridItemStore()
const uiStore = useUIStore()
// 优先使用 props 传入的 components，否则尝试 inject
const components = props.components ?? inject(COMPONENTS_DI_KEY, null)

const faviconUrl = computed(() => {
  if (props.item.favicon) {
    return props.item.favicon
  }
  return faviconService.generateDefaultIcon(props.item.title)
})

const isSelected = computed(() => uiStore.checkedSites.has(props.item.id))

/**
 * 除了当前所在的文件夹的其他文件夹
 */
const availableFolders = computed(() => {
  return gridItemStore.folders.filter(folder => folder.id !== props.item.pid)
})

function handleClick() {
  if (uiStore.isEditMode) {
    uiStore.toggleCheckSite(props.item.id)
  } else {
    window.open(props.item.url, '_self')
  }
}

function openEdit() {
  components?.siteEdit.value?.open({ ...props.item })
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  if (uiStore.isEditMode) return

  const items: ContextmenuItem[] = [
    { icon: Pencil, label: '编辑', action: openEdit }
  ]

  // 如果网站在文件夹内
  if (props.item.pid && availableFolders.value.length) {
    items.push({
      icon: FolderInput,
      label: '移动到分组',
      children: availableFolders.value.map(folder => ({
        label: folder.title,
        action: () => {
          gridItemStore.moveGridItemToFolder(props.item.id, folder.id)
        }
      }))
    })
  }

  if (props.item.pid) {
    items.push({
      icon: FolderOutput,
      label: '移出分组',
      action: () => {
        gridItemStore.moveGridItemOutOfFolder([props.item.id])
      }
    })
  }

  items.push({
    icon: Trash2,
    label: '删除',
    action: () => {
      gridItemStore.deleteGridItems([props.item.id])
    }
  })

  showContextmenu({ x: event.clientX, y: event.clientY, items })
}
</script>

<style scoped>
.site-item {
  touch-action: manipulation;
}
</style>
