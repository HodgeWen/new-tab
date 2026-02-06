<template>
  <div class="actions">
    <n-button variant="glass" :icon="RefreshCw" @click="handleRefresh" />

    <n-button variant="glass" :icon="Pencil" @click="handleEdit" />

    <n-button variant="glass" :icon="Settings" @click="components.setting?.open()" />
  </div>
</template>

<script setup lang="ts">
import { NButton } from '@/components/button'
import { Pencil, RefreshCw, Settings } from 'lucide-vue-next'
import { components } from '@/store/components'

defineOptions({ name: 'NActions' })

function handleRefresh() {
  console.log('refresh')
}

function handleEdit() {
  console.log('edit')
}
</script>

<style scoped>
.actions {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
</style>
