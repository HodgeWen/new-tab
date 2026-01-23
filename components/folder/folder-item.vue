<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FolderItem, GridSize } from '@/types'
import { isSiteItem, FOLDER_SIZE_PRESETS } from '@/types'
import { useGridItemStore } from '@/stores/grid-items'
import { faviconService } from '@/services/favicon'
import { useContextMenu } from '@/shadcn/ui/context-menu'
import type { ContextMenuItemConfig } from '@/shadcn/ui/context-menu/use-context-menu'
import { COMPONENTS_DI_KEY } from '@/utils/di'
import { FolderOpen, Maximize2, Pencil, Trash2 } from 'lucide-vue-next'

defineOptions({
  name: 'FolderItem'
})

const props = defineProps<{
  item: FolderItem
}>()

const emit = defineEmits<{
  open: []
}>()

const gridItemStore = useGridItemStore()
const { show } = useContextMenu()
const components = inject(COMPONENTS_DI_KEY, null)

const size = computed<GridSize>(() => {
  return props.item.size ?? { w: 2, h: 2 }
})

const layout = computed(() => {
  const { w, h } = size.value

  const cols = w === 2 ? 3 : 1
  const rows = h === 2 ? 3 : 1
  const items = cols * rows

  return {
    items,
    cols,
    rows,
    gap: '1rem'
  }
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

const sizeStyles = computed(() => getSizeStyles(size.value))

const children = computed(() => gridItemStore.getFolderChildren(props.item.id))

const previewItems = computed(() => {
  return children.value.slice(0, layout.value.items).map(child => {
    const defaultIcon = {
      id: child.id,
      favicon: '',
      title: child.title,
      url: ''
    }

    if (isSiteItem(child)) {
      return {
        id: child.id,
        favicon: child.favicon || faviconService.getFaviconUrl(child.url),
        title: child.title,
        url: child.url
      }
    }
    return defaultIcon
  })
})

const itemCount = computed(() => children.value.length)

function handleFolderClick() {
  emit('open')
}

function handlePreviewClick(url: string) {
  window.open(url, '_self')
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  const items: ContextMenuItemConfig[] = [
    {
      icon: Pencil,
      label: '编辑',
      action: () =>
        components?.folderEdit.value?.open({
          id: props.item.id,
          title: props.item.title,
          size: size.value
        })
    },
    {
      type: 'submenu',
      icon: Maximize2,
      label: '调整尺寸',
      items: [
        {
          label: '1×2',
          action: () => gridItemStore.updateFolderSize(props.item.id, {
            w: FOLDER_SIZE_PRESETS.narrow.w,
            h: FOLDER_SIZE_PRESETS.narrow.h
          })
        },
        {
          label: '2×2',
          action: () => gridItemStore.updateFolderSize(props.item.id, {
            w: FOLDER_SIZE_PRESETS.square.w,
            h: FOLDER_SIZE_PRESETS.square.h
          })
        },
        {
          label: '2×1',
          action: () => gridItemStore.updateFolderSize(props.item.id, {
            w: FOLDER_SIZE_PRESETS.wide.w,
            h: FOLDER_SIZE_PRESETS.wide.h
          })
        }
      ]
    },
    { type: 'divider' },
    {
      icon: Trash2,
      label: '删除',
      danger: true,
      action: async () => {
        if (confirm('确定要删除这个文件夹吗？文件夹内的网站将移到外部。')) {
          await gridItemStore.deleteGridItem(props.item.id)
        }
      }
    }
  ]

  show({
    x: event.clientX,
    y: event.clientY,
    items
  })
}
</script>

<template>
  <div
    :style="sizeStyles"
    class="folder-item group flex flex-col select-none"
    @contextmenu="handleContextMenu"
  >
    <div class="flex-1 rounded-2xl glass p-2 overflow-hidden cursor-default">
      <div
        v-if="previewItems.length > 0"
        class="grid place-items-center w-full h-full"
        :style="{
          gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
          gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
          gap: layout.gap
        }"
      >
        <img
          v-for="preview in previewItems"
          :key="preview.id"
          :src="preview.favicon"
          :alt="preview.title"
          :title="preview.title"
          class="rounded-lg object-contain hover:bg-white/10 transition-colors cursor-pointer"
          @click.stop="handlePreviewClick(preview.url)"
          @error="
            ;($event.target as HTMLImageElement).src =
              faviconService.generateDefaultIcon(preview.title)
          "
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
      <span v-if="itemCount > layout.items" class="text-xs text-white/50">
        +{{ itemCount - layout.items }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.folder-item {
  touch-action: manipulation;
}
</style>
