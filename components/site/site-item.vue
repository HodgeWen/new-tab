<template>
  <div class="site-item">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { SiteItem } from '@/types'

defineOptions({
  name: 'SiteItem'
})

defineProps<{
  item: SiteItem
}>()
</script>
