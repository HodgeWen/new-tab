<script setup lang="ts">
import { computed } from 'vue'
import type { FolderItem, GridSize } from '@/types'
import { isSiteItem } from '@/types'
import { useGridItemStore } from '@/stores/grid-items'
import { faviconService } from '@/services/favicon'
import { FolderOpen } from 'lucide-vue-next'

interface Props {
  item: FolderItem
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
  contextmenu: [event: MouseEvent]
}>()

const gridItemStore = useGridItemStore()

// 根据文件夹尺寸计算显示数量和网格配置
const layout = computed(() => {
  const { w, h } = props.item.size

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

/**
 * 根据文件夹尺寸计算样式
 */
function getSizeStyles(size: GridSize) {
  const baseSize = 72
  const gap = 16
  const { w, h } = size

  return {
    width: `${baseSize * w + gap * (w - 1)}px`,
    height: `${baseSize * h + gap * (h - 1) + 20}px`
  }
}

// 根据文件夹尺寸计算样式
const sizeStyles = computed(() => getSizeStyles(props.item.size))

// 获取文件夹内的预览项目
const previewItems = computed(() => {
  const children = gridItemStore.getFolderChildren(props.item.id)

  return children.slice(0, layout.value.items).map(child => {
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

// 文件夹内项目总数
const itemCount = computed(() => props.item.children.length)

// 处理点击文件夹（标题区域）
function handleFolderClick() {
  emit('click')
}

// 处理点击预览图标
function handlePreviewClick(url: string) {
  window.open(url, '_self')
}

// 处理右键菜单
function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  emit('contextmenu', event)
}
</script>

<template>
  <div
    :style="sizeStyles"
    class="folder-card group flex flex-col select-none"
    @contextmenu="handleContextMenu"
  >
    <!-- 文件夹容器 -->
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
        <!-- 预览项目 -->
        <img
          v-for="preview in previewItems"
          :src="preview.favicon"
          :key="preview.id"
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

    <!-- 标题和数量 -->
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
.folder-card {
  touch-action: manipulation;
}
</style>
