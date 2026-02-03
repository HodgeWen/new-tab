<template>
  <Transition
    appear
    enter-active-class="transition-all duration-200 ease-out"
    leave-active-class="transition-all duration-150 ease-in"
    enter-from-class="opacity-0 scale-95"
    leave-to-class="opacity-0 scale-95"
    @after-leave="emit('close')"
  >
    <div
      v-if="visible"
      ref="menuRef"
      class="fixed z-50 min-w-[10rem] rounded-xl p-1.5 bg-white/15 backdrop-blur-xl border border-white/15 shadow-xl"
      :style="menuStyle"
    >
      <template v-for="(item, index) in items" :key="index">
        <!-- 带子菜单的项 -->
        <div
          v-if="item.children?.length"
          class="relative"
          @mouseenter="openSubmenu(index)"
          @mouseleave="scheduleCloseSubmenu"
        >
          <div
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 outline-none select-none cursor-default transition-colors duration-150"
            :class="
              activeSubmenu === index
                ? 'bg-white/20 text-white'
                : 'hover:bg-white/20 hover:text-white'
            "
          >
            <component :is="item.icon" v-if="item.icon" class="size-4 text-white/60" />
            <span class="flex-1">{{ item.label }}</span>
            <ChevronRight class="size-4 text-white/40" />
          </div>

          <!-- 子菜单 -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 scale-95 translate-x-1"
            leave-to-class="opacity-0 scale-95 translate-x-1"
          >
            <div
              v-if="activeSubmenu === index"
              class="absolute left-full top-0 z-50 ml-1.5 min-w-[10rem] rounded-xl p-1.5 bg-white/15 backdrop-blur-xl border border-white/15 shadow-xl"
            >
              <button
                v-for="(sub, subIndex) in item.children"
                :key="subIndex"
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 outline-none select-none cursor-default hover:bg-white/20 hover:text-white active:bg-white/25 transition-colors duration-150"
                @click="handleAction(sub)"
              >
                <component :is="sub.icon" v-if="sub.icon" class="size-4 text-white/60" />
                <span class="flex-1 text-left">{{ sub.label }}</span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- 普通菜单项 -->
        <button
          v-else
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 outline-none select-none cursor-default hover:bg-white/20 hover:text-white active:bg-white/25 transition-colors duration-150"
          @click="handleAction(item)"
        >
          <component :is="item.icon" v-if="item.icon" class="size-4 text-white/60" />
          <span class="flex-1 text-left">{{ item.label }}</span>
        </button>
      </template>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import type { ContextmenuItem } from './type'

const props = defineProps<{ x: number; y: number; context?: any; items: ContextmenuItem<any>[] }>()

const emit = defineEmits<{ close: [] }>()

const visible = ref(true)
const menuRef = ref<HTMLDivElement | null>(null)
const activeSubmenu = ref<number | null>(null)
const isInitialized = ref(false)
const submenuCloseTimer = ref<ReturnType<typeof setTimeout> | null>(null)

function openSubmenu(index: number) {
  if (submenuCloseTimer.value) {
    clearTimeout(submenuCloseTimer.value)
    submenuCloseTimer.value = null
  }
  activeSubmenu.value = index
}

function scheduleCloseSubmenu() {
  submenuCloseTimer.value = setTimeout(() => {
    activeSubmenu.value = null
    submenuCloseTimer.value = null
  }, 100)
}

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
  if (!item.action) return
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
  // 忽略触发菜单打开的原始事件，避免菜单刚显示就被关闭
  if (!isInitialized.value) return

  // 右键在菜单内时阻止浏览器默认菜单
  // 右键在菜单外时不做任何事，让父组件通过重新渲染来更新菜单位置
  if (menuRef.value?.contains(event.target as Node)) {
    event.preventDefault()
  }
}

onMounted(() => {
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('contextmenu', handleContextMenu)
    // 延迟标记为已初始化，跳过触发菜单打开的原始 contextmenu 事件
    requestAnimationFrame(() => {
      isInitialized.value = true
    })
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('contextmenu', handleContextMenu)
  if (submenuCloseTimer.value) {
    clearTimeout(submenuCloseTimer.value)
  }
})
</script>
