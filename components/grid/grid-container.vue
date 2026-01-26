<template>
  <div class="grid-container w-full">
    <div ref="gridContainer" class="grid-stack" />

    <!-- 空状态 -->
    <div
      v-if="gridItemStore.items.length === 0"
      class="flex flex-col items-center justify-center py-20 text-white/50"
    >
      <BookmarkPlus class="size-16 mb-4" />
      <p class="text-lg">还没有收藏任何网站</p>
      <p class="text-sm mt-2">右键点击空白处添加网站或文件夹</p>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { BookmarkPlus } from 'lucide-vue-next'
import { ref, onMounted, onBeforeUnmount, render } from 'vue'
import { GridStack, type GridStackNode, type GridStackWidget } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import { useGridItemStore } from '@/stores/grid-items'
import {
  type GridItem,
  type SiteItem as ISiteItem,
  type FolderItem as IFolderItem,
  GridItemType,
  FolderForm,
  SiteForm
} from '@/types'
import { SiteItem } from '@/components/site'
import { FolderItem } from '@/components/folder'
import { nanoid } from 'nanoid'

const emit = defineEmits<{ 'open-folder': [id: string] }>()

const gridItemStore = useGridItemStore()

const gridContainer = ref<HTMLElement>()
let grid: GridStack | null = null
let isUpdating = false
const shadowDom: Record<string, HTMLElement> = {}

const renderMap: Record<GridItemType, (item: GridItem) => any> = {
  site: item => {
    return <SiteItem item={item as ISiteItem} />
  },
  folder: item => {
    return <FolderItem item={item as IFolderItem} />
  }
}

function renderWidgetContent(el: HTMLElement, item: GridItem) {
  const vnode = renderMap[item.type](item)

  if (vnode) {
    shadowDom[item.id] = el
    render(vnode, el)
  }
}

async function handleGridChange(items: GridStackNode[]) {
  const updates: Array<{
    id: string
    position: { x: number; y: number; w: number; h: number }
  }> = []

  for (const item of items) {
    if (item.id && item.x !== undefined && item.y !== undefined) {
      updates.push({
        id: String(item.id),
        position: { x: item.x, y: item.y, w: item.w ?? 1, h: item.h ?? 1 }
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

function initGridStack() {
  if (!gridContainer.value || grid) return

  GridStack.renderCB = (el: HTMLElement, widget: GridStackWidget) => {
    const item = gridItemStore.itemsMap.get(widget.id!)
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
      columnOpts: { columnWidth: 88, columnMax: 12, layout: 'compact' }
    },
    gridContainer.value
  )

  grid.on('removed', (_event: Event, items: GridStackNode[]) => {
    items.forEach(item => {
      if (shadowDom[item.id!]) {
        render(null, shadowDom[item.id!])
        delete shadowDom[item.id!]
      }
    })
  })

  grid.on('change', (_event: Event, items: GridStackNode[]) => {
    if (isUpdating) return
    handleGridChange(items)
  })
}

gridItemStore.onLoad(items => {
  grid?.load(
    items.map(item => {
      const { position } = item

      return { id: item.id, ...position, noResize: true }
    })
  )
})

/**
 * 添加网格项
 * @param item 网格项
 */
function addWidget(item: SiteForm | FolderForm) {
  if (!grid) return

  const widgetData = {
    id: nanoid(10),
    content: item.title,
    ...(item.type === 'site' ? { w: 1, h: 1 } : item.size)
  }
  const el = grid.addWidget(widgetData)
  const x = +el.getAttribute('gs-x')!
  const y = +el.getAttribute('gs-y')!

  // 同步到Store中
  console.log({ ...item, id: widgetData.id, position: { x, y } })
  gridItemStore.addGridItem({ ...item, id: widgetData.id, position: { x, y } })
}

onMounted(() => {
  initGridStack()
})

onBeforeUnmount(() => {
  Object.values(shadowDom).forEach(el => {
    render(null, el)
  })

  if (grid) {
    grid.destroy(false)
    grid = null
  }
})

defineExpose({ addWidget })
</script>

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
.grid-stack * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.grid-stack::-webkit-scrollbar,
.grid-stack *::-webkit-scrollbar {
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
