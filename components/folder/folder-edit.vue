<template>
  <Dialog>
    <slot />
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog } from '@/shadcn/ui/dialog'

defineOptions({
  name: 'FolderEdit'
})
</script>
