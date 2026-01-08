<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useBookmarkStore } from '@/stores/bookmarks'
import { isSiteItem, isFolderItem, type BookmarkItem, type SiteItem } from '@/types'
import { faviconService } from '@/services/favicon'

const uiStore = useUIStore()
const bookmarkStore = useBookmarkStore()

const isVisible = computed(() => uiStore.openFolderId !== null)
const folder = computed(() => {
  if (!uiStore.openFolderId) return null
  const item = bookmarkStore.bookmarks[uiStore.openFolderId]
  return item && isFolderItem(item) ? item : null
})

const children = computed(() => {
  if (!folder.value) return []
  return bookmarkStore.getFolderChildren(folder.value.id)
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
    await bookmarkStore.reorder(currentOrder, folder.value.id)
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
  uiStore.closeFolder()
}

// 右键菜单
function handleContextMenu(event: MouseEvent, item: BookmarkItem) {
  event.preventDefault()
  event.stopPropagation()

  const target = isSiteItem(item) ? 'site' : 'folder'
  uiStore.openContextMenu(event.clientX, event.clientY, target, item)
}

// 打开网站
function openSite(site: SiteItem) {
  window.open(site.url, '_self')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible && folder"
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="closeFolder"
      >
        <div class="w-full max-w-md mx-4 rounded-2xl glass overflow-hidden">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 class="text-lg font-semibold text-white">{{ folder.title }}</h2>
            <button
              class="p-2 rounded-lg hover:bg-white/10 transition-colors"
              @click="closeFolder"
            >
              <div class="i-lucide-x w-5 h-5 text-white/70" />
            </button>
          </div>

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
                  <div class="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center mb-2 transition-all group-hover:scale-105">
                    <img
                      :src="item.favicon || faviconService.getFaviconUrl(item.url)"
                      :alt="item.title"
                      class="w-8 h-8 rounded pointer-events-none"
                      @error="($event.target as HTMLImageElement).src = faviconService.generateDefaultIcon(item.title)"
                    >
                  </div>
                  <span class="text-xs text-white/80 text-center line-clamp-2 max-w-[72px]">
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
              <div class="i-lucide-folder-open w-12 h-12 mx-auto mb-3" />
              <p>文件夹是空的</p>
              <p class="text-xs mt-1">拖拽网站到这里添加</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
