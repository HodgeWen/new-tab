<template>
  <div class="grid-layout" ref="gridContainer"></div>
</template>

<script setup lang="ts">
import { useGridStack } from './use-grid-stack'

defineOptions({ name: 'NGridLayout' })

const { addWidget } = useGridStack('gridContainer')

defineExpose({ addWidget })
</script>
