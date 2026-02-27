<template>
  <div class="folder-item" :class="`folder-${item.size}`" @contextmenu.prevent="handleContextMenu">
    <div class="folder-content glass" @click="handleClick">
      <n-folder-preview :size="item.size" :sites="item.sites ?? []" />
    </div>
    <div class="folder-title">{{ item.title }}</div>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import { components } from '@/store/components'
import { showContextmenu } from '@/components/context-menu'
import NFolderPreview from './folder-preview.vue'
import type { FolderItemUI } from '@/types/ui'

defineOptions({ name: 'NFolderItem' })

const { item } = defineProps<{ item: FolderItemUI }>()

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
  gap: var(--spacing-sm);
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
  --folder-content-padding: 12px;
  padding: var(--folder-content-padding);
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

.folder-title {
  --folder-title-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-size: var(--text-body);
  color: var(--text-primary);
  text-shadow: var(--folder-title-shadow);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 var(--spacing-xs);
}
</style>
