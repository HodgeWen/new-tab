<script setup lang="ts">
import { ref } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import type { ContextmenuItem } from './types'

defineOptions({ name: 'NContextMenuItem' })

const { item, context } = defineProps<{
  item: ContextmenuItem<any>
  context?: any
}>()

const emit = defineEmits<{
  close: []
}>()

const isHovered = ref(false)

const handleClick = () => {
  if (item.children && item.children.length > 0) {
    return
  }
  
  if (item.action) {
    item.action(context)
    emit('close')
  }
}
</script>

<template>
  <div
    class="context-menu-item"
    :class="{ 'has-children': item.children && item.children.length > 0 }"
    @click.stop="handleClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="item-content">
      <component :is="item.icon" v-if="item.icon" class="icon" />
      <span class="label">{{ item.label }}</span>
      <span v-if="item.children && item.children.length > 0" class="arrow">
        <ChevronRight :size="14" />
      </span>
    </div>

    <transition name="submenu-fade">
      <div v-if="item.children && item.children.length > 0 && isHovered" class="submenu">
        <NContextMenuItem
          v-for="(child, index) in item.children"
          :key="index"
          :item="child"
          :context="context"
          @close="emit('close')"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.context-menu-item {
  position: relative;
  width: 100%;
}

.item-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--text-body);
  transition: all var(--transition-fast);
}

.item-content:hover {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.icon {
  width: 16px;
  height: 16px;
  margin-right: var(--spacing-sm);
  opacity: 0.8;
}

.label {
  flex: 1;
  white-space: nowrap;
}

.arrow {
  margin-left: var(--spacing-sm);
  opacity: 0.6;
  display: flex;
  align-items: center;
}

.submenu {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 4px;
  min-width: 160px;
  padding: 4px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--glass-shadow-elevated);
  z-index: 10;
}

.submenu-fade-enter-active,
.submenu-fade-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.submenu-fade-enter-from,
.submenu-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
