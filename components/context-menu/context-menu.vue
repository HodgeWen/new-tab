<template>
  <div class="context-menu"></div>
</template>

<script setup lang="ts">
import type { ContextmenuItem } from './types'

defineOptions({ name: 'NContextMenu' })

const props = defineProps<{ x: number; y: number; context?: any; items: ContextmenuItem<any>[] }>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>
