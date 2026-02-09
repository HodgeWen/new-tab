<template>
  <div class="grid-stack" ref="gridContainer"></div>
</template>

<script setup lang="ts">
import { useGridStack } from './use-grid-stack'

defineOptions({ name: 'NGridLayout' })

const { addWidget, removeWidget, detachWidget, attachWidget, updateWidget, batchRemoveWidgets } =
  useGridStack('gridContainer')

defineExpose({
  addWidget,
  removeWidget,
  detachWidget,
  attachWidget,
  updateWidget,
  batchRemoveWidgets
})
</script>

<style>
/* GridStack 创建的元素需要非 scoped 样式才能生效 */
.grid-stack {
  width: 100%;
  min-height: 200px;
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

/* 拖拽时的占位符样式 */
.grid-stack-placeholder > .placeholder-content {
  border: 2px dashed var(--glass-border-strong, rgba(255, 255, 255, 0.2));
  border-radius: var(--radius-md, 12px);
  background: var(--glass-bg, rgba(255, 255, 255, 0.08));
  backdrop-filter: blur(8px);
}
</style>
