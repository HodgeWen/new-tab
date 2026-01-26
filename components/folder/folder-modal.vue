<template>
  <Dialog v-model:open="visible" :modal="false">
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

      <div class="p-6">
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="site in folder.children"
            :key="site.id"
            class="transition-all"
            :class="{
              'opacity-50': draggedId === site.id,
              'scale-105': dragOverId === site.id
            }"
            draggable="true"
            @dragstart="handleDragStart($event, site.id)"
            @dragover="handleDragOver($event, site.id)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, site.id)"
            @dragend="handleDragEnd"
            @contextmenu="handleContextMenu($event, site)"
          >
            <SiteItem :item="site" />
          </div>
        </div>

        <div
          v-if="folder.children.length === 0"
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

<script setup lang="ts">
import { computed, ref, shallowRef, watch, inject } from 'vue'
import { useGridItemStore } from '@/stores/grid-items'
import type { SiteItem as ISiteItem, FolderItem } from '@/types'
import { useContextMenu } from '@/shadcn/ui/context-menu'
import type { ContextMenuItemConfig } from '@/shadcn/ui/context-menu/use-context-menu'
import { COMPONENTS_DI_KEY } from '@/utils/di'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shadcn/ui/dialog'
import { FolderOpen, FolderInput, FolderOutput, Pencil, Trash2 } from 'lucide-vue-next'
import { SiteItem } from '@/components/site'

defineOptions({ name: 'FolderModal' })

const gridItemStore = useGridItemStore()
const { show } = useContextMenu()
const components = inject(COMPONENTS_DI_KEY, null)

const visible = ref(false)
const folderId = ref<string | null>(null)
const folder = shallowRef<FolderItem & { children: ISiteItem[] }>()

const availableFolders = computed(() => {
  if (!folder.value) return []
  return gridItemStore.folders.filter(item => item.id !== folder.value?.id)
})

const draggedId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)

function handleDragStart(event: DragEvent, itemId: string) {
  draggedId.value = itemId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', itemId)
  }
}

function handleDragOver(event: DragEvent, itemId: string) {
  event.preventDefault()
  if (draggedId.value && draggedId.value !== itemId) {
    dragOverId.value = itemId
  }
}

function handleDragLeave() {
  dragOverId.value = null
}

async function handleDrop(event: DragEvent, targetId: string) {
  event.preventDefault()
  dragOverId.value = null

  if (!draggedId.value || !folder.value || draggedId.value === targetId) {
    draggedId.value = null
    return
  }

  const currentOrder = folder.value.children.map(item => item.id)
  const oldIndex = currentOrder.indexOf(draggedId.value)
  const newIndex = currentOrder.indexOf(targetId)

  if (oldIndex !== -1 && newIndex !== -1) {
    currentOrder.splice(oldIndex, 1)
    currentOrder.splice(newIndex, 0, draggedId.value)
    await gridItemStore.reorder(currentOrder, folder.value.id)
  }

  draggedId.value = null
}

function handleDragEnd() {
  draggedId.value = null
  dragOverId.value = null
}

function handleContextMenu(event: MouseEvent, item: ISiteItem) {
  event.preventDefault()
  event.stopPropagation()

  const items: ContextMenuItemConfig[] = [
    {
      icon: Pencil,
      label: '编辑',
      action: () => components?.siteEdit.value?.open({ ...item })
    }
  ]

  if (availableFolders.value.length > 0) {
    items.push({
      type: 'submenu',
      icon: FolderInput,
      label: '移动到分组',
      items: availableFolders.value.map(target => ({
        label: target.title,
        action: () => gridItemStore.moveGridItemToFolder(item.id, target.id)
      }))
    })
  }

  items.push(
    {
      icon: FolderOutput,
      label: '移出分组',
      action: () => gridItemStore.moveGridItemOutOfFolder(item.id)
    },
    { type: 'divider' },
    {
      icon: Trash2,
      label: '删除',
      danger: true,
      action: async () => {
        if (confirm('确定要删除这个网站吗？')) {
          await gridItemStore.deleteGridItems([item.id])
        }
      }
    }
  )

  show({ x: event.clientX, y: event.clientY, items })
}

function openFolder(data: FolderItem & { children: ISiteItem[] }) {
  folder.value = data
  visible.value = true
}

watch(visible, value => {
  if (!value) {
    folderId.value = null
  }
})

defineExpose({ open: openFolder })
</script>
