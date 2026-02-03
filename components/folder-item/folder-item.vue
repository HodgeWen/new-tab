<template>
  <div class="folder-item">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { FolderItemUI } from '@/types/ui'

defineOptions({ name: 'NFolderItem' })

defineProps<{ item: FolderItemUI }>()
</script>
