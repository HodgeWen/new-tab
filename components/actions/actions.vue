<template>
  <div class="actions">
    <n-button :icon="RefreshCw" @click="handleRefresh"></n-button>
    <n-button :icon="Pencil" @click="handleEdit"></n-button>
    <n-button :icon="Settings" @click="modals.setting?.open()"></n-button>
  </div>
</template>

<script setup lang="ts">
import { NButton } from '@/components/button'
import { Pencil, RefreshCw, Settings } from 'lucide-vue-next'
import { modals } from '@/store/modals'

defineOptions({ name: 'NActions' })

function handleRefresh() {
  console.log('refresh')
}

function handleEdit() {
  console.log('edit')
}
</script>
