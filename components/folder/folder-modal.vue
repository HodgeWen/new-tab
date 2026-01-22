<template>
  <Dialog class="folder-modal">
    <slot />
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog } from '@/shadcn/ui/dialog'

defineOptions({
  name: 'FolderModal'
})
</script>
