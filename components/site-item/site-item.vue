<template>
  <div class="site-item">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { SiteItemUI } from '@/types/ui'

defineOptions({ name: 'NSiteItem' })

defineProps<{ item: SiteItemUI }>()
</script>
