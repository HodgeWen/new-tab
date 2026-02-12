<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, watch, useTemplateRef } from 'vue'
import type { ContextmenuItem } from './types'
import NContextMenuItem from './context-menu-item.vue'

defineOptions({ name: 'NContextMenu' })

const { x, y, context, items } = defineProps<{
  x: number
  y: number
  context?: any
  items: ContextmenuItem<any>[]
}>()

const emit = defineEmits<{ close: [] }>()

const menuRef = useTemplateRef<HTMLElement>('menuRef')

// Basic collision detection to keep menu within viewport
watch(
  () => [x, y, items],
  async () => {
    if (items.length === 0) return

    await nextTick()
    if (!menuRef.value) return

    const rect = menuRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Adjust horizontal position
    if (rect.right > viewportWidth) {
      menuRef.value.style.left = `${x - rect.width}px`
    } else {
      menuRef.value.style.left = `${x}px`
    }

    // Adjust vertical position
    if (rect.bottom > viewportHeight) {
      menuRef.value.style.top = `${y - rect.height}px`
    } else {
      menuRef.value.style.top = `${y}px`
    }
  }
)

// Close on escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <teleport to="body">
    <transition name="context-menu-fade">
      <div
        v-if="items.length > 0"
        class="context-menu-wrapper"
        :style="{ left: `${x}px`, top: `${y}px` }"
        @click.stop
        ref="menuRef"
      >
        <div class="context-menu-content">
          <NContextMenuItem
            v-for="(item, index) in items"
            :key="index"
            :item="item"
            :context="context"
            @close="emit('close')"
          />
        </div>
      </div>
    </transition>

    <!-- Transparent overlay to handle click outside -->
    <div
      v-if="items.length > 0"
      class="context-menu-overlay"
      @click="emit('close')"
      @contextmenu.prevent="emit('close')"
    ></div>
  </teleport>
</template>

<style scoped>
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  background: transparent;
}

.context-menu-wrapper {
  position: fixed;
  z-index: 9999;
  min-width: 180px;
}

.context-menu-content {
  padding: 4px;
  background: var(--glass-bg-elevated);
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--glass-shadow-elevated);
}

.context-menu-fade-enter-active,
.context-menu-fade-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.context-menu-fade-enter-from,
.context-menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
