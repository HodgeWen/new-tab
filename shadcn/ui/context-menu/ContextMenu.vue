<template>
  <Transition
    enter-active-class="transition-all duration-150 ease-out"
    leave-active-class="transition-all duration-100 ease-in"
    enter-from-class="opacity-0 scale-95"
    leave-to-class="opacity-0 scale-95"
    @after-leave="emit('close')"
  >
    <div
      v-if="visible"
      ref="menuRef"
      class="fixed z-50 min-w-[8rem] overflow-hidden rounded-md bg-popover text-popover-foreground border p-1 shadow-md"
      :style="menuStyle"
    >
      <template v-for="(item, index) in items" :key="index">
        <!-- 有子菜单 -->
        <div
          v-if="item.children?.length"
          class="group relative"
          @mouseenter="activeSubmenu = index"
          @mouseleave="activeSubmenu = null"
        >
          <div
            class="flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
            :class="{
              'bg-accent text-accent-foreground': activeSubmenu === index
            }"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              class="mr-2 size-4 text-muted-foreground"
            />
            <span class="flex-1">{{ item.label }}</span>
            <ChevronRight class="ml-auto size-4" />
          </div>

          <!-- 子菜单内容 -->
          <Transition
            enter-active-class="transition-all duration-150 ease-out"
            leave-active-class="transition-all duration-100 ease-in"
            enter-from-class="opacity-0 scale-95"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="activeSubmenu === index"
              class="absolute left-full top-0 z-50 ml-1 min-w-[8rem] overflow-hidden rounded-md bg-popover text-popover-foreground border p-1 shadow-lg"
            >
              <button
                v-for="(sub, subIndex) in item.children"
                :key="subIndex"
                class="flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
                @click="handleAction(sub)"
              >
                <component
                  :is="sub.icon"
                  v-if="sub.icon"
                  class="size-4 text-muted-foreground"
                />
                {{ sub.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- 普通菜单项 -->
        <button
          v-else
          class="flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
          @click="handleAction(item)"
        >
          <component
            :is="item.icon"
            v-if="item.icon"
            class="size-4 text-muted-foreground"
          />
          {{ item.label }}
        </button>
      </template>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import type { ContextmenuItem } from './type'

const props = defineProps<{
  x: number
  y: number
  context?: any
  items: ContextmenuItem<any>[]
}>()

const emit = defineEmits<{ close: [] }>()

const visible = ref(true)
const menuRef = ref<HTMLDivElement | null>(null)
const activeSubmenu = ref<number | null>(null)

const menuStyle = computed(() => {
  let { x, y } = props
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

  return { left: `${x}px`, top: `${y}px` }
})

function handleAction(item: ContextmenuItem<any>) {
  hide()
  if (props.context !== undefined) {
    item.action(props.context)
  } else {
    ;(item.action as () => void)()
  }
}

function hide() {
  visible.value = false
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

function handleContextMenu(event: MouseEvent) {
  if (menuRef.value?.contains(event.target as Node)) {
    event.preventDefault()
  } else {
    hide()
  }
}

onMounted(() => {
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('contextmenu', handleContextMenu)
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('contextmenu', handleContextMenu)
})
</script>
