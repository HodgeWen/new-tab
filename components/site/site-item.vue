<template>
  <div
    class="site-item group flex flex-col items-center cursor-pointer select-none relative"
    :class="{ 'edit-mode': uiStore.isEditMode }"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <Transition name="scale-fade">
      <div
        v-if="uiStore.isEditMode"
        class="absolute -top-1 -right-1 z-10 size-5 rounded-full flex items-center justify-center transition-all duration-200"
        :class="
          isSelected
            ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
            : 'bg-white/20 border border-white/30'
        "
      >
        <Check v-if="isSelected" class="size-3 text-white" />
      </div>
    </Transition>

    <div
      class="size-14 rounded-2xl glass flex items-center justify-center mb-2 transition-all duration-200"
      :class="[
        uiStore.isEditMode
          ? isSelected
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent scale-95'
            : 'opacity-80 hover:opacity-100'
          : 'glass-hover group-hover:scale-105'
      ]"
    >
      <img
        :src="faviconUrl"
        :alt="item.title"
        class="size-8 rounded-lg"
        @error="
          ;($event.target as HTMLImageElement).src =
            faviconService.generateDefaultIcon(item.title)
        "
      />
    </div>

    <span
      class="text-xs text-center line-clamp-2 max-w-[72px] text-shadow transition-all duration-200"
      :class="isSelected ? 'text-white' : 'text-white/80'"
    >
      {{ item.title }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { SiteItem } from '@/types'
import { faviconService } from '@/services/favicon'
import { useGridItemStore } from '@/stores/grid-items'
import { useUIStore } from '@/stores/ui'
import { useContextMenu } from '@/shadcn/ui/context-menu'
import type { ContextMenuItemConfig } from '@/shadcn/ui/context-menu/use-context-menu'
import { COMPONENTS_DI_KEY } from '@/utils/di'
import {
  Check,
  FolderInput,
  FolderOutput,
  Pencil,
  Trash2
} from 'lucide-vue-next'

defineOptions({ name: 'SiteItem' })

const { item } = defineProps<{ item: SiteItem }>()

const gridItemStore = useGridItemStore()
const uiStore = useUIStore()
const { show } = useContextMenu()
const components = inject(COMPONENTS_DI_KEY, null)

const faviconUrl = computed(() => {
  if (item.favicon) {
    return item.favicon
  }
  return faviconService.getFaviconUrl(item.url)
})

const isSelected = computed(() => uiStore.checkedSites.has(item.id))

const availableFolders = computed(() => {
  return gridItemStore.allFolders.filter(folder => folder.id !== item.pid)
})

function handleClick() {
  if (uiStore.isEditMode) {
    uiStore.toggleCheckSite(item.id)
  } else {
    window.open(item.url, '_self')
  }
}

function openEdit() {
  components?.siteEdit.value?.open({ ...item })
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  if (uiStore.isEditMode) return

  const items: ContextMenuItemConfig[] = [
    { icon: Pencil, label: '编辑', action: openEdit }
  ]

  if (availableFolders.value.length > 0) {
    items.push({
      type: 'submenu',
      icon: FolderInput,
      label: '移动到分组',
      items: availableFolders.value.map(folder => ({
        label: folder.title,
        action: () =>
          gridItemStore.moveGridItem(
            item.id,
            folder.id,
            gridItemStore.getFolderChildren(folder.id).length
          )
      }))
    })
  }

  if (item.pid) {
    items.push({
      icon: FolderOutput,
      label: '移出分组',
      action: () =>
        gridItemStore.moveGridItem(
          item.id,
          null,
          gridItemStore.rootOrder.length
        )
    })
  }

  items.push(
    { type: 'divider' },
    {
      icon: Trash2,
      label: '删除',
      danger: true,
      action: async () => {
        if (confirm('确定要删除这个网站吗？')) {
          await gridItemStore.deleteGridItem(item.id)
        }
      }
    }
  )

  show({ x: event.clientX, y: event.clientY, items })
}
</script>

<style scoped>
.site-item {
  touch-action: manipulation;
}

.site-item.edit-mode {
  animation: wiggle 0.3s ease-in-out;
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-1deg);
  }
  75% {
    transform: rotate(1deg);
  }
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.2s ease;
}

.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
