<template>
  <div
    :style="sizeStyles"
    class="folder-item group flex flex-col select-none"
    @contextmenu="handleContextMenu"
  >
    <div class="flex-1 rounded-2xl glass p-2 overflow-hidden cursor-default">
      <div
        v-if="previewSites.length > 0"
        class="grid place-items-center w-full h-full"
        :style="{
          gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
          gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
          gap: layout.gap
        }"
      >
        <SiteItem
          v-for="site in previewSites"
          :key="site.id"
          :item="site"
          preview
          size="sm"
        />
      </div>

      <FolderOpen v-else class="size-8 text-white/30" />
    </div>

    <div
      class="mt-1 text-center leading-tight cursor-pointer hover:text-white transition-colors"
      @click="handleFolderClick"
    >
      <span
        class="text-xs text-white/80 line-clamp-1 text-shadow group-hover:text-white"
      >
        {{ item.title }}
      </span>
      <span
        v-if="item.children.length > layout.items"
        class="text-xs text-white/50"
      >
        +{{ item.children.length - layout.items }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FolderUIItem, GridSize } from '@/types'
import { useGridItemStore } from '@/stores/grid-items'
import { useContextMenu } from '@/shadcn/ui/context-menu'
import type { ContextMenuItemConfig } from '@/shadcn/ui/context-menu/use-context-menu'
import { COMPONENTS_DI_KEY } from '@/utils/di'
import { FolderOpen, Maximize2, Pencil, Trash2 } from 'lucide-vue-next'
import { FOLDER_SIZE_PRESETS } from './helper'
import { SiteItem } from '@/components/site'

defineOptions({ name: 'FolderItem' })

const { item } = defineProps<{ item: FolderUIItem }>()

const emit = defineEmits<{ open: [] }>()

const gridItemStore = useGridItemStore()
const { show } = useContextMenu()

const components = inject(COMPONENTS_DI_KEY)!

const layout = computed(() => {
  const { w, h } = item.size

  const cols = w === 2 ? 3 : 1
  const rows = h === 2 ? 3 : 1
  const items = cols * rows

  return { items, cols, rows, gap: '1rem' }
})

/** 预览显示的网站（限制数量） */
const previewSites = computed(() => {
  return item.children.slice(0, layout.value.items)
})

function getSizeStyles(size: GridSize) {
  const baseSize = 72
  const gap = 16
  const { w, h } = size

  return {
    width: `${baseSize * w + gap * (w - 1)}px`,
    height: `${baseSize * h + gap * (h - 1) + 20}px`
  }
}

const sizeStyles = computed(() => getSizeStyles(item.size))

function handleFolderClick() {
  emit('open')
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  const items: ContextMenuItemConfig[] = [
    {
      icon: Pencil,
      label: '编辑',
      action: () => {
        components?.folderEdit.value?.open({
          type: 'folder',
          id: item.id,
          title: item.title,
          size: item.size
        })
      }
    },
    {
      type: 'submenu',
      icon: Maximize2,
      label: '调整尺寸',
      items: Object.entries(FOLDER_SIZE_PRESETS).map(([_, value]) => ({
        label: value.label,
        action: () => {
          gridItemStore.updateGridItem(item.id, {
            size: { w: value.w, h: value.h }
          })
        }
      }))
    },
    { type: 'divider' },
    {
      icon: Trash2,
      label: '删除',
      danger: true,
      action: async () => {
        if (confirm('确定要删除这个文件夹吗？文件夹内的网站将移到外部。')) {
          await gridItemStore.deleteGridItems([item.id])
        }
      }
    }
  ]

  show({ x: event.clientX, y: event.clientY, items })
}
</script>

<style scoped>
.folder-item {
  touch-action: manipulation;
}
</style>
