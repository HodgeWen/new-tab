<script setup lang="ts">
import { computed, watch, onUnmounted, ref } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useBookmarkStore } from '@/stores/bookmarks'
import { isFolderItem, type FolderSize, type FolderItem } from '@/types'

const uiStore = useUIStore()
const bookmarkStore = useBookmarkStore()
const menuRef = ref<HTMLDivElement>()

const isVisible = computed(() => uiStore.contextMenu.visible)
const target = computed(() => uiStore.contextMenu.target)
const targetItem = computed(() => uiStore.contextMenu.targetItem)

// 获取所有文件夹（用于"移动到分组"功能）
const availableFolders = computed(() => {
  const folders: FolderItem[] = []
  for (const item of Object.values(bookmarkStore.bookmarks)) {
    // 排除当前项目本身（如果是文件夹）和当前项目所在的文件夹
    if (isFolderItem(item)) {
      // 如果目标项目在这个文件夹内，不显示该文件夹
      if (targetItem.value && item.children.includes(targetItem.value.id)) {
        continue
      }
      // 不能移动到自己
      if (targetItem.value && item.id === targetItem.value.id) {
        continue
      }
      folders.push(item)
    }
  }
  return folders
})

// 计算菜单位置（确保不超出视口）
const menuStyle = computed(() => {
  let x = uiStore.contextMenu.x
  let y = uiStore.contextMenu.y

  // 简单的边界检测
  if (typeof window !== 'undefined') {
    const menuWidth = 180
    const menuHeight = 250
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10
    }
  }

  return {
    left: `${x}px`,
    top: `${y}px`,
  }
})

// 菜单项
const menuItems = computed(() => {
  if (target.value === 'blank') {
    return [
      { icon: 'i-lucide-plus', label: '新增网站', action: 'addSite' },
      { icon: 'i-lucide-folder-plus', label: '新增文件夹', action: 'addFolder' },
      { type: 'divider' },
      { icon: 'i-lucide-settings', label: '设置', action: 'openSettings' },
    ]
  }

  if (target.value === 'site') {
    const items: any[] = [
      { icon: 'i-lucide-pencil', label: '编辑', action: 'editSite' },
    ]

    // 如果有可用的文件夹，添加"移动到分组"选项
    if (availableFolders.value.length > 0) {
      items.push({
        type: 'submenu',
        icon: 'i-lucide-folder-input',
        label: '移动到分组',
        submenu: availableFolders.value.map(folder => ({
          label: folder.title,
          action: 'moveToFolder',
          value: folder.id,
        }))
      })
    }

    // 如果当前项目在文件夹内，添加"移出分组"选项
    if (targetItem.value?.parentId) {
      items.push({
        icon: 'i-lucide-folder-output',
        label: '移出分组',
        action: 'moveOutOfFolder',
      })
    }

    items.push(
      { type: 'divider' },
      { icon: 'i-lucide-trash-2', label: '删除', action: 'deleteSite', danger: true },
    )

    return items
  }

  if (target.value === 'folder') {
    return [
      { icon: 'i-lucide-pencil', label: '编辑', action: 'editFolder' },
      { type: 'submenu', icon: 'i-lucide-maximize-2', label: '调整尺寸', submenu: [
        { label: '1×2', action: 'resizeFolder', value: '1x2' as FolderSize },
        { label: '2×2', action: 'resizeFolder', value: '2x2' as FolderSize },
        { label: '2×1', action: 'resizeFolder', value: '2x1' as FolderSize },
      ] },
      { type: 'divider' },
      { icon: 'i-lucide-trash-2', label: '删除', action: 'deleteFolder', danger: true },
    ]
  }

  return []
})

// 处理菜单操作
async function handleAction(action: string, value?: unknown) {
  // 先保存 targetItem，因为 closeContextMenu 会将其设为 null
  const item = targetItem.value
  uiStore.closeContextMenu()

  switch (action) {
    case 'addSite':
      uiStore.openModal('addSite')
      break
    case 'addFolder':
      uiStore.openModal('addFolder')
      break
    case 'openSettings':
      uiStore.openSettingsPanel()
      break
    case 'editSite':
      if (item) {
        uiStore.openModal('editSite', item)
      }
      break
    case 'deleteSite':
      if (item && confirm('确定要删除这个网站吗？')) {
        await bookmarkStore.deleteBookmark(item.id)
      }
      break
    case 'editFolder':
      if (item) {
        uiStore.openModal('editFolder', item)
      }
      break
    case 'deleteFolder':
      if (item && confirm('确定要删除这个文件夹吗？文件夹内的网站将移到外部。')) {
        await bookmarkStore.deleteBookmark(item.id)
      }
      break
    case 'resizeFolder':
      if (item && isFolderItem(item) && value) {
        await bookmarkStore.updateFolderSize(item.id, value as FolderSize)
      }
      break
    case 'moveToFolder':
      if (item && value) {
        // 获取目标文件夹
        const targetFolder = bookmarkStore.bookmarks[value as string]
        if (targetFolder && isFolderItem(targetFolder)) {
          // 移动到文件夹末尾
          await bookmarkStore.moveBookmark(item.id, value as string, targetFolder.children.length)
        }
      }
      break
    case 'moveOutOfFolder':
      if (item) {
        // 移动到根级别末尾
        await bookmarkStore.moveBookmark(item.id, null, bookmarkStore.rootOrder.length)
      }
      break
  }
}

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    uiStore.closeContextMenu()
  }
}

// ESC 关闭
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    uiStore.closeContextMenu()
  }
}

watch(isVisible, visible => {
  if (visible) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      leave-active-class="transition-all duration-100 ease-in"
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isVisible"
        ref="menuRef"
        class="fixed z-50 min-w-[180px] py-2 rounded-xl glass shadow-xl"
        :style="menuStyle"
      >
        <template v-for="(item, index) in menuItems" :key="index">
          <!-- 分隔线 -->
          <div v-if="item.type === 'divider'" class="my-1.5 border-t border-white/10" />

          <!-- 子菜单 -->
          <div
            v-else-if="item.type === 'submenu'"
            class="group relative px-3 py-2 flex items-center gap-3 hover:bg-white/10 cursor-pointer"
          >
            <div :class="item.icon" class="w-4 h-4 text-white/70" />
            <span class="flex-1 text-sm text-white/90">{{ item.label }}</span>
            <div class="i-lucide-chevron-right w-4 h-4 text-white/50" />

            <!-- 子菜单内容 -->
            <div
              class="absolute left-full top-0 ml-1 min-w-[120px] max-w-[200px] max-h-[240px] overflow-y-auto py-2 rounded-xl glass shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
            >
              <button
                v-for="sub in item.submenu"
                :key="sub.value"
                class="w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10 truncate"
                :title="sub.label"
                @click="handleAction(sub.action, sub.value)"
              >
                {{ sub.label }}
              </button>
            </div>
          </div>

          <!-- 普通菜单项 -->
          <button
            v-else
            class="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors"
            :class="{ 'text-red-400 hover:text-red-300': item.danger }"
            @click="handleAction(item.action!)"
          >
            <div :class="[item.icon, 'w-4 h-4', item.danger ? '' : 'text-white/70']" />
            <span class="text-sm" :class="item.danger ? '' : 'text-white/90'">{{ item.label }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>
