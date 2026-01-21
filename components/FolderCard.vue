<script setup lang="ts">
import { computed } from 'vue'
import type { FolderItem, GridSize } from '@/types'
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
    return {
      id: child.id,
      favicon: child.favicon || faviconService.getFaviconUrl(child.url),
      title: child.title
    }
  })
})

// 文件夹内项目总数
const itemCount = computed(() => props.item.children.length)

// 处理点击
function handleClick() {
  emit('click')
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
    class="folder-card group flex flex-col cursor-pointer select-none"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <!-- 文件夹容器 -->
    <div class="flex-1 rounded-2xl glass p-2 overflow-hidden">
      <!-- 预览网格 - 使用 flex 布局实现居中 -->
      <div class="w-full h-full flex items-center justify-center">
        <div
          v-if="previewItems.length > 0"
          class="grid place-items-center w-full h-full"
          :style="{
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
            gap: layout.gap
          }"
        >
          <!-- 预览项目 - 只显示图标，无背景 -->
          <img
            v-for="preview in previewItems"
            :src="preview.favicon"
            :alt="preview.title"
            :key="preview.id"
            class="rounded-lg object-contain"
            @error="
              ;($event.target as HTMLImageElement).src =
                faviconService.generateDefaultIcon(preview.title)
            "
          />
        </div>

        <!-- 空文件夹提示 -->
        <div v-else class="flex items-center justify-center w-full h-full">
          <FolderOpen class="size-8 text-white/30" />
        </div>
      </div>
    </div>

    <!-- 标题和数量 -->
    <div class="mt-1 text-center leading-tight">
      <span class="text-xs text-white/80 line-clamp-1 text-shadow">
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
