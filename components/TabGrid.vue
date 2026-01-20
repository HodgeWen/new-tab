<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  h,
  render
} from 'vue'
import { GridStack, type GridStackNode, type GridStackWidget } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import { useGridItemStore } from '@/stores/grid-items'
import { useUIStore } from '@/stores/ui'
import { isSiteItem, isFolderItem, type GridItem } from '@/types'
import BookmarkCard from './BookmarkCard.vue'
import FolderCard from './FolderCard.vue'

const gridItemStore = useGridItemStore()
const uiStore = useUIStore()

// 容器引用
const gridContainer = ref<HTMLElement>()
// GridStack 实例
let grid: GridStack | null = null
// 是否正在更新（防止循环更新）
let isUpdating = false
// 存储渲染的 Vue 组件元素（官方推荐方式）
const shadowDom: Record<string, HTMLElement> = {}

// 将网格项数据转换为 GridStack widget 数据
function itemToWidget(item: GridItem): GridStackWidget {
  let w = 1
  let h = 1

  if (isFolderItem(item)) {
    w = item.size.w
    h = item.size.h
  }

  const position = item.gridPosition

  return {
    id: item.id,
    x: position?.x,
    y: position?.y,
    w: position?.w ?? w,
    h: position?.h ?? h,
    noResize: true
  }
}

// 渲染 Vue 组件到 GridStack 元素
function renderWidgetContent(el: HTMLElement, item: GridItem) {
  let vnode

  if (isSiteItem(item)) {
    vnode = h(BookmarkCard, {
      item,
      isEditMode: uiStore.isEditMode,
      isSelected: uiStore.isSelected(item.id),
      onContextmenu: (event: MouseEvent) => handleContextMenu(event, item),
      onToggleSelect: () => handleToggleSelect(item.id)
    })
  } else if (isFolderItem(item)) {
    vnode = h(FolderCard, {
      item,
      onClick: () => handleFolderClick(item.id),
      onContextmenu: (event: MouseEvent) => handleContextMenu(event, item)
    })
  }

  if (vnode) {
    shadowDom[item.id] = el
    render(vnode, el)
  }
}

// 处理选中切换
function handleToggleSelect(id: string) {
  uiStore.toggleSelectItem(id)
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
    isUpdating = true
    try {
      await gridItemStore.batchUpdateGridPositions(updates)
    } finally {
      setTimeout(() => {
        isUpdating = false
      }, 100)
    }
  }
}

// 右键菜单处理
function handleContextMenu(event: MouseEvent, item: GridItem) {
  event.preventDefault()
  event.stopPropagation()
  const target = isSiteItem(item) ? 'site' : 'folder'
  uiStore.openContextMenu(event.clientX, event.clientY, target, item)
}

// 点击文件夹
function handleFolderClick(folderId: string) {
  uiStore.openFolder(folderId)
}

// 加载网格项到 GridStack
function loadGridItems() {
  if (!grid) return

  const widgets = gridItemStore.rootGridItems.map(itemToWidget)
  grid.load(widgets)
}

// 重新渲染所有已存在的组件（用于编辑模式切换）
function rerenderExistingWidgets() {
  for (const item of gridItemStore.rootGridItems) {
    const el = shadowDom[item.id]
    if (el) {
      renderWidgetContent(el, item)
    }
  }
}

// 初始化 GridStack
function initGridStack() {
  if (!gridContainer.value || grid) return

  // 先迁移旧数据
  gridItemStore.migrateToGridLayout(8)

  // 设置全局渲染回调（官方 V11+ 推荐方式）
  GridStack.renderCB = (el: HTMLElement, widget: GridStackWidget) => {
    const item = gridItemStore.gridItems[String(widget.id)]
    if (!item) return
    renderWidgetContent(el, item)
  }

  grid = GridStack.init(
    {
      cellHeight: 92,
      margin: 8,
      float: false,
      animate: false,
      disableResize: true,
      acceptWidgets: false,
      staticGrid: false,
      columnOpts: {
        columnWidth: 88,
        columnMax: 12,
        layout: 'compact'
      }
    },
    gridContainer.value
  )

  // 监听元素移除事件，清理 Vue 渲染（官方推荐方式）
  grid.on('removed', (_event: Event, items: GridStackNode[]) => {
    items.forEach(item => {
      if (shadowDom[item.id!]) {
        render(null, shadowDom[item.id!])
        delete shadowDom[item.id!]
      }
    })
  })

  // 监听位置变化
  grid.on('change', (_event: Event, items: GridStackNode[]) => {
    if (isUpdating) return
    handleGridChange(items)
  })

  // 使用 load 方法加载网格项（官方推荐方式）
  loadGridItems()
}

// 监听网格项列表变化（仅当网格项增删时重新加载）
watch(
  () => gridItemStore.rootGridItems.map(b => b.id).join(','),
  () => {
    if (!isUpdating && grid) {
      nextTick(() => {
        // 清理现有渲染
        Object.keys(shadowDom).forEach(id => {
          render(null, shadowDom[id])
          delete shadowDom[id]
        })
        grid!.removeAll(false)
        loadGridItems()
      })
    }
  }
)

// 监听编辑模式和选中状态变化
watch(
  () => [uiStore.isEditMode, uiStore.selectedIds],
  () => {
    rerenderExistingWidgets()
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    initGridStack()
  })
})

onBeforeUnmount(() => {
  // 清理 Vue 渲染（官方推荐方式）
  Object.values(shadowDom).forEach(el => {
    render(null, el)
  })

  // 销毁 GridStack
  if (grid) {
    grid.destroy(false)
    grid = null
  }
})
</script>

<template>
  <div class="tab-grid w-full">
    <div ref="gridContainer" class="grid-stack" />

    <!-- 空状态 -->
    <div
      v-if="gridItemStore.rootGridItems.length === 0 && !gridItemStore.loading"
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
  display: flex;
  align-items: center;
  justify-content: center;
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
  cursor: grabbing !important;
}

.grid-stack-item.ui-draggable-dragging > .grid-stack-item-content {
  opacity: 1 !important;
  transform: scale(1.05);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: none !important;
  box-shadow: none !important;
}

/* 移除拖动元素内部所有元素的阴影 */
.grid-stack-item.ui-draggable-dragging * {
  box-shadow: none !important;
  filter: none !important;
}

/* 隐藏 GridStack 默认的调整大小手柄 */
.grid-stack-item > .ui-resizable-handle {
  display: none !important;
}
</style>
