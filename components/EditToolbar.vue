<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useGridItemStore } from '@/stores/grid-items'
import { isSiteItem } from '@/types'

const uiStore = useUIStore()
const gridItemStore = useGridItemStore()

// 下拉菜单状态
const showFolderMenu = ref(false)

// 获取可选中的网格项（只有普通网站，不包含文件夹）
const selectableSites = computed(() => {
  return gridItemStore.rootGridItems.filter(isSiteItem)
})

// 是否全选
const isAllSelected = computed(() => {
  if (selectableSites.value.length === 0) return false
  return selectableSites.value.every(site => uiStore.isSelected(site.id))
})

// 全选/取消全选
function toggleSelectAll() {
  if (isAllSelected.value) {
    uiStore.clearSelection()
  } else {
    const ids = selectableSites.value.map(site => site.id)
    uiStore.selectAll(ids)
  }
}

// 删除选中项
async function deleteSelected() {
  if (uiStore.selectedCount === 0) return

  const confirmed = confirm(
    `确定要删除选中的 ${uiStore.selectedCount} 个书签吗？`
  )
  if (!confirmed) return

  const ids = Array.from(uiStore.selectedIds)
  await gridItemStore.batchDeleteGridItems(ids)
  uiStore.clearSelection()
}

// 移动到文件夹
async function moveToFolder(folderId: string) {
  if (uiStore.selectedCount === 0) return

  const ids = Array.from(uiStore.selectedIds)
  await gridItemStore.batchMoveToFolder(ids, folderId)
  uiStore.clearSelection()
  showFolderMenu.value = false
}

// 创建新分组并移入
function createNewFolder() {
  showFolderMenu.value = false
  uiStore.openModal('addFolder')
}

// 关闭下拉菜单
function closeFolderMenu() {
  showFolderMenu.value = false
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="uiStore.isEditMode"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <!-- 已选数量 -->
        <div
          class="flex items-center gap-2 text-white/80 text-sm pr-3 border-r border-white/20"
        >
          <span class="font-medium">{{ uiStore.selectedCount }}</span>
          <span>已选</span>
        </div>

        <!-- 全选按钮 -->
        <button
          class="toolbar-btn"
          :class="{ active: isAllSelected }"
          title="全选"
          @click="toggleSelectAll"
        >
          <div class="i-lucide-check-square w-5 h-5" />
          <span class="text-xs">全选</span>
        </button>

        <!-- 移入分组下拉 -->
        <div class="relative">
          <button
            class="toolbar-btn"
            :disabled="uiStore.selectedCount === 0"
            title="移入分组"
            @click="showFolderMenu = !showFolderMenu"
          >
            <div class="i-lucide-folder-input w-5 h-5" />
            <span class="text-xs">移入分组</span>
          </button>

          <!-- 文件夹下拉菜单 -->
          <Transition name="fade-scale">
            <div
              v-if="showFolderMenu"
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[180px] max-h-[240px] overflow-y-auto bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl py-2"
            >
              <!-- 现有文件夹列表 -->
              <template v-if="gridItemStore.allFolders.length > 0">
                <button
                  v-for="folder in gridItemStore.allFolders"
                  :key="folder.id"
                  class="folder-menu-item"
                  @click="moveToFolder(folder.id)"
                >
                  <div class="i-lucide-folder w-4 h-4 text-yellow-400" />
                  <span class="truncate">{{ folder.title }}</span>
                </button>
                <div class="border-t border-white/10 my-2" />
              </template>

              <!-- 创建新分组 -->
              <button
                class="folder-menu-item text-blue-400"
                @click="createNewFolder"
              >
                <div class="i-lucide-folder-plus w-4 h-4" />
                <span>创建新分组</span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- 删除按钮 -->
        <button
          class="toolbar-btn text-red-400 hover:text-red-300"
          :disabled="uiStore.selectedCount === 0"
          title="删除"
          @click="deleteSelected"
        >
          <div class="i-lucide-trash-2 w-5 h-5" />
          <span class="text-xs">删除</span>
        </button>

        <!-- 分割线 -->
        <div class="w-px h-8 bg-white/20" />

        <!-- 完成按钮 -->
        <button
          class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
          @click="uiStore.exitEditMode"
        >
          完成
        </button>
      </div>
    </div>
  </Transition>

  <!-- 点击外部关闭下拉菜单 -->
  <div
    v-if="showFolderMenu"
    class="fixed inset-0 z-40"
    @click="closeFolderMenu"
  />
</template>

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

.folder-menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  transition: all 0.15s ease;
}

.folder-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
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

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, 0.5rem) scale(0.95);
}
</style>
