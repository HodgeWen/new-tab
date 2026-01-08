<script setup lang="ts">
import { computed } from 'vue'
import type { FolderItem } from '@/types'
import { useBookmarkStore } from '@/stores/bookmarks'
import { faviconService } from '@/services/favicon'
import { isSiteItem } from '@/types'

interface Props {
  item: FolderItem
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
  contextmenu: [event: MouseEvent]
}>()

const bookmarkStore = useBookmarkStore()

// 根据文件夹尺寸计算显示数量和网格配置
const layoutConfig = computed(() => {
  switch (props.item.size) {
    case '2x2':
      return {
        maxItems: 9, // 3x3 网格
        cols: 3,
        rows: 3,
        iconSize: 'w-6 h-6',
        gap: '0.5rem'
      }
    case '2x1':
      return {
        maxItems: 3, // 1x3 横向
        cols: 3,
        rows: 1,
        iconSize: 'w-7 h-7',
        gap: '0.75rem'
      }
    case '1x2':
    default:
      return {
        maxItems: 3, // 3x1 纵向
        cols: 1,
        rows: 3,
        iconSize: 'w-7 h-7',
        gap: '0.5rem'
      }
  }
})

// 根据文件夹尺寸计算样式
const sizeStyles = computed(() => {
  const baseSize = 72
  const gap = 16

  switch (props.item.size) {
    case '2x2':
      return {
        width: `${baseSize * 2 + gap}px`,
        height: `${baseSize * 2 + gap + 20}px`,
      }
    case '2x1':
      return {
        width: `${baseSize * 2 + gap}px`,
        height: `${baseSize + 20}px`,
      }
    case '1x2':
    default:
      return {
        width: `${baseSize}px`,
        height: `${baseSize * 2 + gap + 20}px`,
      }
  }
})

// 获取文件夹内的预览项目
const previewItems = computed(() => {
  const children = bookmarkStore.getFolderChildren(props.item.id)
  const config = layoutConfig.value

  return children.slice(0, config.maxItems).map(child => {
    if (isSiteItem(child)) {
      return {
        id: child.id,
        favicon: child.favicon || faviconService.getFaviconUrl(child.url),
        title: child.title,
        isFolder: false
      }
    }
    return {
      id: child.id,
      favicon: '',
      title: child.title,
      isFolder: true
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
    <div
      class="flex-1 rounded-2xl glass glass-hover p-3 transition-transform group-hover:scale-[1.02] overflow-hidden"
    >
      <!-- 预览网格 - 使用 flex 布局实现居中 -->
      <div class="w-full h-full flex items-center justify-center">
        <div
          v-if="previewItems.length > 0"
          class="grid place-items-center"
          :style="{
            gridTemplateColumns: `repeat(${layoutConfig.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layoutConfig.rows}, 1fr)`,
            gap: layoutConfig.gap,
            width: '100%',
            height: '100%'
          }"
        >
          <!-- 预览项目 - 只显示图标，无背景 -->
          <div
            v-for="preview in previewItems"
            :key="preview.id"
            class="flex items-center justify-center"
          >
            <template v-if="preview.isFolder">
              <div class="i-lucide-folder text-white/60" :class="layoutConfig.iconSize" />
            </template>
            <template v-else>
              <img
                :src="preview.favicon"
                :alt="preview.title"
                :class="layoutConfig.iconSize"
                class="rounded object-contain"
                @error="
                  ($event.target as HTMLImageElement).src =
                    faviconService.generateDefaultIcon(preview.title)
                "
              />
            </template>
          </div>
        </div>

        <!-- 空文件夹提示 -->
        <div
          v-else
          class="flex items-center justify-center w-full h-full"
        >
          <div class="i-lucide-folder-open w-8 h-8 text-white/30" />
        </div>
      </div>
    </div>

    <!-- 标题和数量 -->
    <div class="mt-1 text-center leading-tight">
      <span class="text-xs text-white/80 line-clamp-1 text-shadow">
        {{ item.title }}
      </span>
      <span v-if="itemCount > layoutConfig.maxItems" class="text-xs text-white/50">
        +{{ itemCount - layoutConfig.maxItems }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.folder-card {
  touch-action: manipulation;
}
</style>
