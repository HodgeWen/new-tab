<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, h, render } from 'vue'
import { GridStack, type GridStackNode, type GridStackWidget } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import 'gridstack/dist/gridstack-extra.min.css' // 支持 2-11 列的响应式布局
import { useBookmarkStore } from '@/stores/bookmarks'
import { useUIStore } from '@/stores/ui'
import {
  isSiteItem,
  isFolderItem,
  type BookmarkItem,
  type FolderSize
} from '@/types'
import BookmarkCard from './BookmarkCard.vue'
import FolderCard from './FolderCard.vue'

const bookmarkStore = useBookmarkStore()
const uiStore = useUIStore()

// 容器引用
const gridContainer = ref<HTMLElement>()
// GridStack 实例（不使用 ref 以避免代理问题）
let grid: GridStack | null = null
// 栅格列数（基于容器宽度动态计算）
const gridCols = ref(8)
// 是否正在更新（防止循环更新）
let isUpdating = false
// 存储渲染的 Vue 组件容器
const renderedComponents = new Map<string, HTMLElement>()

// 根据文件夹尺寸获取网格尺寸
function getFolderGridSize(size: FolderSize): { w: number; h: number } {
  switch (size) {
    case '2x2':
      return { w: 2, h: 2 }
    case '2x1':
      return { w: 2, h: 1 }
    case '1x2':
    default:
      return { w: 1, h: 2 }
  }
}

// 将书签数据转换为 GridStack widget 数据
function bookmarkToWidget(item: BookmarkItem, colCount: number): GridStackWidget {
  let w = 1
  let h = 1

  if (isFolderItem(item)) {
    const size = getFolderGridSize(item.size)
    w = size.w
    h = size.h
  }

  // 使用已保存的位置或让 GridStack 自动计算
  const position = item.gridPosition

  // 如果有保存的位置，检查是否超出当前列数
  let x = position?.x
  if (x !== undefined && x + w > colCount) {
    // 位置超出边界，让 GridStack 自动计算
    x = undefined
  }

  return {
    id: item.id,
    x,
    y: x !== undefined ? position?.y : undefined, // 如果 x 被重置，y 也需要重置让系统自动布局
    w: position?.w ?? w,
    h: position?.h ?? h,
    noResize: true // 禁用调整大小
  }
}

// 计算栅格列数
function updateGridCols() {
  if (!gridContainer.value) return

  const containerWidth = gridContainer.value.clientWidth
  const itemWidth = 72 // 单个项目宽度
  const gap = 16 // 间距

  // 计算可容纳的列数
  const cols = Math.floor((containerWidth + gap) / (itemWidth + gap))
  const newCols = Math.max(4, Math.min(cols, 12)) // 限制在 4-12 列

  if (newCols !== gridCols.value) {
    gridCols.value = newCols
    // 更新 GridStack 列数，使用 'none' 保持位置，然后手动紧凑
    if (grid) {
      grid.column(newCols, 'none')
      // 紧凑布局，防止元素超出边界或重叠
      grid.compact()
    }
  }
}

// 渲染 Vue 组件到指定元素
function renderVueComponent(item: BookmarkItem, container: HTMLElement) {
  // 清理旧的渲染
  if (renderedComponents.has(item.id)) {
    const oldContainer = renderedComponents.get(item.id)!
    render(null, oldContainer)
  }

  if (isSiteItem(item)) {
    const vnode = h(BookmarkCard, {
      item,
      isEditMode: uiStore.isEditMode,
      isSelected: uiStore.isSelected(item.id),
      onContextmenu: (event: MouseEvent) => handleContextMenu(event, item),
      onToggleSelect: () => handleToggleSelect(item.id)
    })
    render(vnode, container)
  } else if (isFolderItem(item)) {
    const vnode = h(FolderCard, {
      item,
      onClick: () => handleFolderClick(item.id),
      onContextmenu: (event: MouseEvent) => handleContextMenu(event, item)
    })
    render(vnode, container)
  }

  renderedComponents.set(item.id, container)
}

// 处理选中切换
function handleToggleSelect(id: string) {
  uiStore.toggleSelectItem(id)
}

// 初始化 GridStack
function initGridStack() {
  if (!gridContainer.value || grid) return

  // 先迁移旧数据
  bookmarkStore.migrateToGridLayout(gridCols.value)

  grid = GridStack.init(
    {
      column: gridCols.value,
      cellHeight: 92, // 卡片高度 (72px icon + 20px text)
      margin: 8,
      float: false, // 禁用浮动，自动堆叠
      animate: false, // 禁用动画，避免加载时突兀的效果
      disableResize: true, // 禁用调整大小
      acceptWidgets: false, // 不接受外部 widget
      staticGrid: false // 允许拖拽
    },
    gridContainer.value
  )

  // 监听元素添加事件，在添加后渲染 Vue 组件
  grid.on('added', (_event: Event, items: GridStackNode[]) => {
    for (const gsItem of items) {
      if (!gsItem.id || !gsItem.el) continue
      const bookmarkItem = bookmarkStore.bookmarks[gsItem.id]
      if (!bookmarkItem) continue
      const contentEl = gsItem.el.querySelector('.grid-stack-item-content')
      if (contentEl) {
        // 清空并渲染 Vue 组件
        contentEl.innerHTML = ''
        const wrapper = document.createElement('div')
        wrapper.className = 'grid-item-wrapper'
        contentEl.appendChild(wrapper)
        renderVueComponent(bookmarkItem, wrapper)
      }
    }
  })

  // 监听位置变化
  grid.on('change', (_event: Event, items: GridStackNode[]) => {
    if (isUpdating) return
    handleGridChange(items)
  })

  // 加载书签到网格
  loadBookmarksToGrid()
}

// 加载书签到 GridStack
function loadBookmarksToGrid() {
  if (!grid) return

  isUpdating = true
  grid.batchUpdate(true)

  // 清除现有 widget
  grid.removeAll(false)

  // 清理渲染的 Vue 组件
  renderedComponents.forEach(el => {
    render(null, el)
  })
  renderedComponents.clear()

  // 添加书签 widget（不提供 content，由 added 事件处理渲染）
  for (const item of bookmarkStore.rootBookmarks) {
    const widget = bookmarkToWidget(item, gridCols.value)
    grid.addWidget(widget)
  }

  grid.batchUpdate(false)
  isUpdating = false
}

// 处理网格变化
async function handleGridChange(items: GridStackNode[]) {
  const updates: Array<{
    id: string
    position: { x: number; y: number; w: number; h: number }
  }> = []

  for (const item of items) {
    if (item.id && item.x !== undefined && item.y !== undefined) {
      updates.push({
        id: String(item.id),
        position: {
          x: item.x,
          y: item.y,
          w: item.w ?? 1,
          h: item.h ?? 1
        }
      })
    }
  }

  if (updates.length > 0) {
    await bookmarkStore.batchUpdateGridPositions(updates)
  }
}

// 右键菜单处理
function handleContextMenu(event: MouseEvent, item: BookmarkItem) {
  event.preventDefault()
  event.stopPropagation()
  const target = isSiteItem(item) ? 'site' : 'folder'
  uiStore.openContextMenu(event.clientX, event.clientY, target, item)
}

// 点击文件夹
function handleFolderClick(folderId: string) {
  uiStore.openFolder(folderId)
}

// 监听书签变化，重新加载网格
watch(
  () => [bookmarkStore.rootBookmarks, bookmarkStore.rootOrder],
  () => {
    if (!isUpdating && grid) {
      nextTick(() => {
        loadBookmarksToGrid()
      })
    }
  },
  { deep: true }
)

// 监听编辑模式和选中状态变化，重新渲染组件
watch(
  () => [uiStore.isEditMode, uiStore.selectedIds],
  () => {
    // 重新渲染所有 SiteItem 组件以更新编辑模式状态
    for (const item of bookmarkStore.rootBookmarks) {
      if (isSiteItem(item)) {
        const container = renderedComponents.get(item.id)
        if (container) {
          renderVueComponent(item, container)
        }
      }
    }
  },
  { deep: true }
)

// 监听容器大小变化
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateGridCols()

  if (gridContainer.value) {
    resizeObserver = new ResizeObserver(updateGridCols)
    resizeObserver.observe(gridContainer.value)
  }

  // 初始化 GridStack
  nextTick(() => {
    initGridStack()
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()

  // 清理渲染的组件
  renderedComponents.forEach(el => {
    render(null, el)
  })
  renderedComponents.clear()

  // 销毁 GridStack
  if (grid) {
    grid.destroy(false)
    grid = null
  }
})
</script>

<template>
  <div class="bookmark-grid w-full">
    <div ref="gridContainer" class="grid-stack" />

    <!-- 空状态 -->
    <div
      v-if="bookmarkStore.rootBookmarks.length === 0 && !bookmarkStore.loading"
      class="flex flex-col items-center justify-center py-20 text-white/50"
    >
      <div class="i-lucide-bookmark-plus w-16 h-16 mb-4" />
      <p class="text-lg">还没有收藏任何网站</p>
      <p class="text-sm mt-2">右键点击空白处添加网站或文件夹</p>
    </div>
  </div>
</template>

<style>
/* GridStack 基础样式覆盖 */
.grid-stack {
  background: transparent;
  overflow: visible !important;
}

.grid-stack-item {
  background: transparent;
  overflow: visible !important;
}

.grid-stack-item-content {
  background: transparent !important;
  overflow: visible !important;
  inset: 0 !important;
}

/* 强制隐藏所有子元素滚动条 */
.grid-stack,
.grid-stack *,
.grid-stack-item,
.grid-stack-item *,
.grid-stack-item-content,
.grid-stack-item-content * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.grid-stack::-webkit-scrollbar,
.grid-stack *::-webkit-scrollbar,
.grid-stack-item::-webkit-scrollbar,
.grid-stack-item *::-webkit-scrollbar,
.grid-stack-item-content::-webkit-scrollbar,
.grid-stack-item-content *::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 拖拽占位符样式 */
.grid-stack-placeholder > .placeholder-content {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 2px dashed rgba(255, 255, 255, 0.3) !important;
  border-radius: 1rem;
}

/* 拖拽时的样式 */
.grid-stack-item.ui-draggable-dragging {
  z-index: 1000 !important;
}

.grid-stack-item.ui-draggable-dragging > .grid-stack-item-content {
  opacity: 0.9;
  transform: scale(1.05);
  transition: transform 0.15s ease;
}

/* 网格项内容包装器 */
.grid-item-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

/* 隐藏 GridStack 默认的调整大小手柄 */
.grid-stack-item > .ui-resizable-handle {
  display: none !important;
}
</style>
