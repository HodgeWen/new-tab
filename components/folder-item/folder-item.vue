<template>
  <div
    class="folder-item"
    :class="{ editing: isEditing, selected: isSelected }"
    @click="handleClick"
  >
    <slot />
    <span v-if="isEditing" class="folder-check" :class="{ checked: isSelected }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { FolderItemUI } from '@/types/ui'

import { selectedIds, toggleSelect, ui } from '@/store/ui'

defineOptions({ name: 'NFolderItem' })

const { item } = defineProps<{ item: FolderItemUI }>()

const isEditing = computed(() => ui.editing)
const isSelected = computed(() => selectedIds.has(item.id))

function handleClick() {
  if (isEditing.value) {
    toggleSelect(item.id)
  }
}
</script>

<style scoped>
.folder-item {
  position: relative;
}

/* 编辑模式 */
.folder-item.editing {
  cursor: default;
}

.folder-item.selected {
  background: var(--color-primary-subtle);
  border-radius: var(--radius-md);
}

/* 勾选指示器（与 site-item 一致） */
.folder-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--glass-border-strong);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all var(--transition-fast);
  z-index: 1;
}

.folder-check.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.folder-check.checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 7px;
  border: solid #fff;
  border-width: 0 1.5px 1.5px 0;
  transform: translate(-50%, -60%) rotate(45deg);
}
</style>
