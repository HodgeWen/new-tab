<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUI } from '@/composables/useUI'
import { useGridItemStore } from '@/stores/grid-items'
import { isSiteItem, isFolderItem, type GridItem, type SiteItem } from '@/types'
import { faviconService } from '@/services/favicon'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shadcn/ui/dialog'
import { FolderOpen } from 'lucide-vue-next'

const ui = useUI()
const gridItemStore = useGridItemStore()

const isVisible = computed({
  get: () => ui.openFolderId.value !== null,
  set: (value: boolean) => {
    if (!value) closeFolder()
  }
})

const folder = computed(() => {
  if (!ui.openFolderId.value) return null
  const item = gridItemStore.gridItems[ui.openFolderId.value]
  return item && isFolderItem(item) ? item : null
})

const children = computed(() => {
  if (!folder.value) return []
  return gridItemStore.getFolderChildren(folder.value.id)
})

// 拖拽状态
const draggedId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)

// 处理拖拽开始
function handleDragStart(event: DragEvent, itemId: string) {
  draggedId.value = itemId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', itemId)
  }
}

// 处理拖拽经过
function handleDragOver(event: DragEvent, itemId: string) {
  event.preventDefault()
  if (draggedId.value && draggedId.value !== itemId) {
    dragOverId.value = itemId
  }
}

// 处理拖拽离开
function handleDragLeave() {
  dragOverId.value = null
}

// 处理放置
async function handleDrop(event: DragEvent, targetId: string) {
  event.preventDefault()
  dragOverId.value = null

  if (!draggedId.value || !folder.value || draggedId.value === targetId) {
    draggedId.value = null
    return
  }

  const currentOrder = [...folder.value.children]
  const oldIndex = currentOrder.indexOf(draggedId.value)
  const newIndex = currentOrder.indexOf(targetId)

  if (oldIndex !== -1 && newIndex !== -1) {
    // 移动元素
    currentOrder.splice(oldIndex, 1)
    currentOrder.splice(newIndex, 0, draggedId.value)
    await gridItemStore.reorder(currentOrder, folder.value.id)
  }

  draggedId.value = null
}

// 处理拖拽结束
function handleDragEnd() {
  draggedId.value = null
  dragOverId.value = null
}

// 关闭文件夹
function closeFolder() {
  ui.closeFolder()
}

// 右键菜单
function handleContextMenu(event: MouseEvent, item: GridItem) {
  event.preventDefault()
  event.stopPropagation()

  const target = isSiteItem(item) ? 'site' : 'folder'
  ui.openContextMenu(event.clientX, event.clientY, target, item)
}

// 打开网站
function openSite(site: SiteItem) {
  window.open(site.url, '_self')
}
</script>

<template>
  <Dialog v-model:open="isVisible">
    <DialogContent
      v-if="folder"
      class="glass-dialog max-w-md p-0 text-white border-white/20 bg-black/40 backdrop-blur-xl"
    >
      <DialogHeader class="px-6 py-4 border-b border-white/10">
        <DialogTitle class="text-lg font-semibold text-white">
          {{ folder.title }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          查看和管理文件夹内的网站
        </DialogDescription>
      </DialogHeader>

      <!-- 内容区域 -->
      <div class="p-6">
        <div class="grid grid-cols-4 gap-4">
          <template v-for="item in children" :key="item.id">
            <div
              v-if="isSiteItem(item)"
              class="group flex flex-col items-center cursor-pointer select-none transition-all"
              :class="{
                'opacity-50': draggedId === item.id,
                'scale-105': dragOverId === item.id
              }"
              draggable="true"
              @dragstart="handleDragStart($event, item.id)"
              @dragover="handleDragOver($event, item.id)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, item.id)"
              @dragend="handleDragEnd"
              @click="openSite(item)"
              @contextmenu="handleContextMenu($event, item)"
            >
              <div
                class="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center mb-2 transition-all group-hover:scale-105"
              >
                <img
                  :src="
                    item.favicon || faviconService.getFaviconUrl(item.url)
                  "
                  :alt="item.title"
                  class="w-8 h-8 rounded pointer-events-none"
                  @error="
                    ($event.target as HTMLImageElement).src =
                      faviconService.generateDefaultIcon(item.title)
                  "
                />
              </div>
              <span
                class="text-xs text-white/80 text-center line-clamp-2 max-w-[72px]"
              >
                {{ item.title }}
              </span>
            </div>
          </template>
        </div>

        <!-- 空状态 -->
        <div
          v-if="children.length === 0"
          class="text-center py-8 text-white/50"
        >
          <FolderOpen class="size-12 mx-auto mb-3" />
          <p>文件夹是空的</p>
          <p class="text-xs mt-1">拖拽网站到这里添加</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
