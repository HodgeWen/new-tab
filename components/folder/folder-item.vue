<template>
  <div class="folder-item">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { FolderItem } from '@/types'

defineOptions({
  name: 'FolderItem'
})

defineProps<{
  item: FolderItem
}>()
</script>
