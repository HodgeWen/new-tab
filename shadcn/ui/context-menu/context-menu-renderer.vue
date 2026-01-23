<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import {
  useContextMenu,
  type ContextMenuActionItem,
  type ContextMenuDivider,
  type ContextMenuItemConfig,
  type ContextMenuSubmenu
} from './use-context-menu'

const { state, hide } = useContextMenu()
const menuRef = ref<HTMLDivElement | null>(null)

const isVisible = computed(() => state.value.visible)

const menuStyle = computed(() => {
  let { x, y } = state.value
  const padding = 10
  const menuWidth = menuRef.value?.offsetWidth ?? 200
  const menuHeight = menuRef.value?.offsetHeight ?? 240

  if (typeof window !== 'undefined') {
    if (x + menuWidth + padding > window.innerWidth) {
      x = window.innerWidth - menuWidth - padding
    }
    if (y + menuHeight + padding > window.innerHeight) {
      y = window.innerHeight - menuHeight - padding
    }
  }

  return {
    left: `${x}px`,
    top: `${y}px`
  }
})

function isDivider(item: ContextMenuItemConfig): item is ContextMenuDivider {
  return 'type' in item && item.type === 'divider'
}

function isSubmenu(item: ContextMenuItemConfig): item is ContextMenuSubmenu {
  return 'type' in item && item.type === 'submenu'
}

function handleAction(item: ContextMenuActionItem) {
  if (item.disabled) return
  hide()
  item.action()
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    hide()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    hide()
  }
}

watch(isVisible, visible => {
  if (visible) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      leave-active-class="transition-all duration-100 ease-in"
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isVisible"
        ref="menuRef"
        class="fixed z-[100] min-w-[180px] py-2 rounded-xl glass shadow-xl"
        :style="menuStyle"
      >
        <template v-for="(item, index) in state.items" :key="index">
          <div
            v-if="isDivider(item)"
            class="my-1.5 border-t border-white/10"
          />

          <div
            v-else-if="isSubmenu(item)"
            class="group relative px-3 py-2 flex items-center gap-3 hover:bg-white/10 cursor-pointer"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              class="size-4 text-white/70"
            />
            <span class="flex-1 text-sm text-white/90">{{ item.label }}</span>
            <ChevronRight class="size-4 text-white/50" />

            <div
              class="absolute left-full top-0 ml-1 min-w-[120px] max-w-[200px] max-h-[240px] overflow-y-auto py-2 rounded-xl glass shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
            >
              <button
                v-for="sub in item.items"
                :key="sub.label"
                class="w-full px-3 py-2 text-left text-sm transition-colors truncate"
                :class="[
                  sub.disabled
                    ? 'text-white/30 cursor-not-allowed'
                    : sub.danger
                      ? 'text-red-400 hover:text-red-300 hover:bg-white/10'
                      : 'text-white/90 hover:bg-white/10'
                ]"
                :disabled="sub.disabled"
                :title="sub.label"
                @click="handleAction(sub)"
              >
                {{ sub.label }}
              </button>
            </div>
          </div>

          <button
            v-else
            class="w-full px-3 py-2 flex items-center gap-3 transition-colors"
            :class="[
              item.disabled
                ? 'text-white/30 cursor-not-allowed'
                : item.danger
                  ? 'text-red-400 hover:text-red-300 hover:bg-white/10'
                  : 'hover:bg-white/10'
            ]"
            :disabled="item.disabled"
            @click="handleAction(item)"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              class="size-4"
              :class="item.danger ? '' : 'text-white/70'"
            />
            <span class="text-sm" :class="item.danger ? '' : 'text-white/90'">{{
              item.label
            }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>
