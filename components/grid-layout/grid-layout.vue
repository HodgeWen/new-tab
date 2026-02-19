<template>
  <div class="grid-stack" ref="gridContainer"></div>
</template>

<script setup lang="ts">
import { useGridStack } from './use-grid-stack'

defineOptions({ name: 'NGridLayout' })

const {
  addWidget,
  removeWidget,
  detachWidget,
  attachWidget,
  updateWidget,
  batchRemoveWidgets,
  reloadWidgets
} =
  useGridStack('gridContainer')

defineExpose({
  addWidget,
  removeWidget,
  detachWidget,
  attachWidget,
  updateWidget,
  batchRemoveWidgets,
  reloadWidgets
})
</script>

<style>
/* GridStack 创建的元素需要非 scoped 样式才能生效 */
.grid-stack {
  width: 100%;
  min-height: 200px;
}

.grid-stack-item.ui-draggable-dragging {
  box-shadow: none !important;
}

/* widget 内容区域充满整个单元格 */
.grid-stack-item-content {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: visible;
}

.grid-stack-item-content > * {
  width: 100%;
  height: 100%;
}
</style>
