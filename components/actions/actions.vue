<template>
  <div class="actions" :class="{ 'is-editing': ui.editing }">
    <template v-if="ui.editing">
      <n-button
        variant="ghost"
        @click="handleToggleSelectAll"
      >
        {{ isAllSelected ? '取消全选' : '全选' }}
      </n-button>

      <n-button
        variant="danger"
        :icon="Trash2"
        :disabled="!hasSelection"
        @click="handleDeleteSelected"
      >
        {{ hasSelection ? selectedIds.size : '' }}
      </n-button>

      <n-button variant="ghost" :icon="Check" @click="handleDone" />
    </template>

    <template v-else>
      <n-button
        v-if="canRefresh"
        variant="glass"
        :icon="RefreshCw"
        :loading="loading"
        :disabled="!setting.wallpaper"
        @click="handleRefresh"
        title="刷新壁纸"
      />

      <n-button variant="glass" :icon="Pencil" @click="handleEdit" title="编辑" />

      <n-button variant="glass" :icon="Settings" @click="components.setting?.open()" title="设置" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { Check, Pencil, RefreshCw, Settings, Trash2 } from 'lucide-vue-next'

import type { SiteItemUI } from '@/types/ui'

import { NButton } from '@/components/button'
import { gridItems } from '@/store/grid-items'
import { components } from '@/store/components'
import { setting } from '@/store/setting'
import { clearSelection, enterEditMode, exitEditMode, selectedIds, ui } from '@/store/ui'
import { useWallpaper } from '@/hooks/use-wallpaper'

defineOptions({ name: 'NActions' })

const { loading, canRefresh, refreshWallpaper } = useWallpaper()

/** 可选择的顶层 grid item 的 ID（排除文件夹内的站点） */
const selectableIds = computed(() =>
  gridItems.value
    .filter((item) => item.type === 'folder' || (item.type === 'site' && !(item as SiteItemUI).pid))
    .map((item) => item.id)
)

const hasSelection = computed(() => selectedIds.size > 0)

const isAllSelected = computed(
  () => selectableIds.value.length > 0 && selectableIds.value.every((id) => selectedIds.has(id))
)

async function handleRefresh() {
  await refreshWallpaper()
}

function handleEdit() {
  enterEditMode()
}

function handleToggleSelectAll() {
  if (isAllSelected.value) {
    clearSelection()
  } else {
    selectableIds.value.forEach((id) => selectedIds.add(id))
  }
}

function handleDeleteSelected() {
  if (!hasSelection.value) return
  const ids = Array.from(selectedIds)
  components.gridLayout?.batchRemoveWidgets(ids)
  exitEditMode()
}

function handleDone() {
  exitEditMode()
}

/** Escape 键退出编辑模式 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && ui.editing) {
    exitEditMode()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.actions {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* 编辑模式：玻璃面板包裹 */
.actions.is-editing {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xs);
  box-shadow: var(--glass-shadow);
}
</style>
