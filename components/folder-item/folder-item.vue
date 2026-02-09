<template>
  <div class="folder-item" :class="`folder-${item.size}`" @contextmenu.prevent="handleContextMenu">
    <div class="folder-content glass" @click="handleClick">
      <div class="folder-grid" :style="gridStyle">
        <a
          v-for="site in previewSites"
          :key="site.id"
          :href="site.url"
          class="folder-icon-wrapper"
          draggable="false"
          @click.stop
        >
          <img v-if="site.icon" :src="site.icon" class="folder-icon" draggable="false" />
          <div v-else class="folder-icon fallback">{{ getInitial(site.title) }}</div>
        </a>
      </div>
    </div>
    <div class="folder-title">{{ item.title }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { components } from '@/store/components'
import { showContextmenu } from '@/components/context-menu'
import type { FolderItemUI } from '@/types/ui'
import type { FolderSize } from '@/types/common'

defineOptions({ name: 'NFolderItem' })

const { item } = defineProps<{ item: FolderItemUI }>()

const layoutConfig = computed(() => {
  const map: Record<FolderSize, { cols: number; rows: number; max: number }> = {
    horizontal: { cols: 2, rows: 1, max: 2 },
    vertical: { cols: 1, rows: 3, max: 3 },
    square: { cols: 3, rows: 3, max: 9 }
  }
  return map[item.size] || map.square
})

const previewSites = computed(() => {
  return item.sites?.slice(0, layoutConfig.value.max)
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${layoutConfig.value.cols}, 1fr)`,
  gridTemplateRows: `repeat(${layoutConfig.value.rows}, 1fr)`
}))

function getInitial(title: string) {
  return title.charAt(0).toUpperCase()
}

function handleClick() {
  components.folderView?.open(item.id)
}

function handleContextMenu(e: MouseEvent) {
  showContextmenu({
    x: e.clientX,
    y: e.clientY,
    items: [
      { icon: Pencil, label: '编辑文件夹', action: () => components.folder?.open({ ...item }) },
      {
        icon: Trash2,
        label: '删除文件夹',
        action: () => components.gridLayout?.removeWidget(item.id)
      }
    ]
  })
}
</script>

<style scoped>
.folder-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px; /* Gap between folder and title */
}

.folder-content {
  flex: 1;
  width: 100%;
  min-height: 0;
  max-height: calc(100% - 24px);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  cursor: pointer;
  overflow: hidden;
}

/* 方形文件夹保持 1:1 比例 */
.folder-square .folder-content {
  width: auto;
  aspect-ratio: 1;
}

.folder-grid {
  display: grid;
  gap: 8px; /* Space between icons */
  width: 100%;
  height: 100%;
  /* Ensure grid cells are square if possible, or fit container */
  justify-items: center;
  align-items: center;
}

.folder-icon-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  cursor: pointer;
  -webkit-user-drag: none;
}

.folder-icon-wrapper:hover {
  background: var(--glass-bg-hover);
}

.folder-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--radius-sm); /* Slightly rounded icons */
}

.folder-icon.fallback {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: var(--font-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px; /* Small font for preview */
}

.folder-title {
  font-size: 13px;
  color: var(--text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 4px;
}
</style>
