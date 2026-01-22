<template>
  <div class="grid-container w-full">
    <div ref="gridContainer" class="grid-stack" />

    <!-- 空状态 -->
    <div
      v-if="gridItemStore.rootGridItems.length === 0 && !gridItemStore.loading"
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
import { useGridItemStore } from '@/stores/grid-items'
import { GridStack, GridStackNode, GridStackWidget } from 'gridstack'
import { SiteItem } from '@/components/site'
import { FolderItem } from '@/components/folder'
import { GridItem } from '@/types'
import { JSX } from 'vue/jsx-runtime'
import { render } from 'vue'

const gridItemStore = useGridItemStore()

const renderMap: Record<string, (item: GridItem) => JSX.Element> = {
  site: (item: GridItem) => {
    return <SiteItem item={item} />
  },
  folder: (item: GridItem) => {
    return <FolderItem item={item} />
  }
}

const shadowDom: Record<string, HTMLElement> = {}

GridStack.renderCB = (el: HTMLElement, widget: GridStackWidget) => {
  const item = gridItemStore.gridItems[widget.id!]
  if (!item) return

  const vnode = renderMap[item.type]?.(item)
  if (vnode) {
    shadowDom[item.id] = el
    render(vnode, el)
  }
}

let grid: GridStack | null = null
let isUpdating = false

const container = useTemplateRef('gridContainer')
onMounted(() => {
  if (!container.value) return
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
    container.value
  )

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
  })
})

onBeforeUnmount(() => {
  // 清理 Vue 渲染（官方推荐方式）
  Object.values(shadowDom).forEach(el => {
    render(null, el)
  })

  // 销毁 GridStack
  grid?.destroy()
  grid = null
})
</script>
