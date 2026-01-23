<template>
  <Transition name="slide-up">
    <div
      v-if="ui.isEditMode.value"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <!-- 已选数量 -->
        <div
          class="flex items-center gap-2 text-white/80 text-sm pr-3 border-r border-white/20"
        >
          <span class="font-medium">{{ ui.selectedCount.value }}</span>
          <span>已选</span>
        </div>

        <!-- 全选按钮 -->
        <button
          class="toolbar-btn"
          :class="{ active: isAllSelected }"
          title="全选"
          @click="toggleSelectAll"
        >
          <CheckSquare class="size-5" />
          <span class="text-xs">全选</span>
        </button>

        <!-- 移入分组下拉 -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="toolbar-btn"
              :disabled="ui.selectedCount.value === 0"
              title="移入分组"
            >
              <FolderInput class="size-5" />
              <span class="text-xs">移入分组</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="glass border-white/15 text-white min-w-[180px] max-h-[240px] overflow-y-auto"
            align="center"
            side="top"
            :side-offset="8"
          >
            <!-- 现有文件夹列表 -->
            <template v-if="gridItemStore.allFolders.length > 0">
              <DropdownMenuItem
                v-for="folder in gridItemStore.allFolders"
                :key="folder.id"
                class="focus:bg-white/10 focus:text-white cursor-pointer"
                @click="moveToFolder(folder.id)"
              >
                <Folder class="size-4 text-yellow-400 mr-2" />
                <span class="truncate">{{ folder.title }}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator class="bg-white/10" />
            </template>

            <!-- 创建新分组 -->
            <DropdownMenuItem
              class="focus:bg-white/10 focus:text-white cursor-pointer text-blue-400"
              @click="createNewFolder"
            >
              <FolderPlus class="size-4 mr-2" />
              <span>创建新分组</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- 删除按钮 -->
        <button
          class="toolbar-btn text-red-400 hover:text-red-300"
          :disabled="ui.selectedCount.value === 0"
          title="删除"
          @click="deleteSelected"
        >
          <Trash2 class="size-5" />
          <span class="text-xs">删除</span>
        </button>

        <!-- 分割线 -->
        <div class="w-px h-8 bg-white/20" />

        <!-- 完成按钮 -->
        <Button variant="glass" size="sm" @click="ui.exitEditMode">
          完成
        </Button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUI } from '@/composables/useUI'
import { useGridItemStore } from '@/stores/grid-items'
import { isSiteItem } from '@/types'

import { Button } from '@/shadcn/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shadcn/ui/dropdown-menu'
import {
  CheckSquare,
  FolderInput,
  Trash2,
  Folder,
  FolderPlus
} from 'lucide-vue-next'

const ui = useUI()
const gridItemStore = useGridItemStore()

// 获取可选中的网格项（只有普通网站，不包含文件夹）
const selectableSites = computed(() => {
  return gridItemStore.rootGridItems.filter(isSiteItem)
})

// 是否全选
const isAllSelected = computed(() => {
  if (selectableSites.value.length === 0) return false
  return selectableSites.value.every(site => ui.isSelected(site.id))
})

// 全选/取消全选
function toggleSelectAll() {
  if (isAllSelected.value) {
    ui.clearSelection()
  } else {
    const ids = selectableSites.value.map(site => site.id)
    ui.selectAll(ids)
  }
}

// 删除选中项
async function deleteSelected() {
  if (ui.selectedCount.value === 0) return

  const confirmed = confirm(
    `确定要删除选中的 ${ui.selectedCount.value} 个书签吗？`
  )
  if (!confirmed) return

  const ids = Array.from(ui.selectedIds.value)
  await gridItemStore.batchDeleteGridItems(ids)
  ui.clearSelection()
}

// 移动到文件夹
async function moveToFolder(folderId: string) {
  if (ui.selectedCount.value === 0) return

  const ids = Array.from(ui.selectedIds.value)
  await gridItemStore.batchMoveToFolder(ids, folderId)
  ui.clearSelection()
}

// 创建新分组并移入
function createNewFolder() {
  ui.openModal('addFolder')
}
</script>

<style scoped>
.toolbar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 1);
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 1rem);
}
</style>
