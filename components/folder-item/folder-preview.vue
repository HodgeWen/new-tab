<script setup lang="ts">
import { computed } from 'vue'

import type { FolderSize } from '@/types/common'
import type { SiteItemUI } from '@/types/ui'

defineOptions({ name: 'NFolderPreview' })

const { size, sites } = defineProps<{
  size: FolderSize
  sites: readonly SiteItemUI[]
}>()

const layoutMap: Record<FolderSize, { cols: number; rows: number; max: number }> = {
  horizontal: { cols: 2, rows: 1, max: 2 },
  vertical: { cols: 1, rows: 3, max: 3 },
  square: { cols: 3, rows: 3, max: 9 }
}

const layoutConfig = computed(() => layoutMap[size] ?? layoutMap.square)

const previewSites = computed(() => sites.slice(0, layoutConfig.value.max))

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${layoutConfig.value.cols}, 1fr)`,
  gridTemplateRows: `repeat(${layoutConfig.value.rows}, 1fr)`
}))

function getInitial(title: string) {
  return title.charAt(0).toUpperCase()
}
</script>

<template>
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
</template>

<style scoped>
.folder-grid {
  display: grid;
  gap: var(--spacing-sm);
  width: 100%;
  height: 100%;
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
  border-radius: var(--radius-sm);
}

.folder-icon.fallback {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: var(--font-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-caption);
}
</style>
