<script setup lang="ts">
import { computed } from 'vue'
import type { SiteItem } from '@/types'
import { faviconService } from '@/services/favicon'
import { Check } from 'lucide-vue-next'

interface Props {
  item: SiteItem
  isEditMode?: boolean
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  isSelected: false
})

const emit = defineEmits<{
  contextmenu: [event: MouseEvent]
  toggleSelect: [id: string]
}>()

// favicon URL
const faviconUrl = computed(() => {
  if (props.item.favicon) {
    return props.item.favicon
  }
  return faviconService.getFaviconUrl(props.item.url)
})

// 处理点击
function handleClick() {
  if (props.isEditMode) {
    emit('toggleSelect', props.item.id)
  } else {
    window.open(props.item.url, '_self')
  }
}

// 处理右键菜单
function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  // 编辑模式下禁用右键菜单
  if (!props.isEditMode) {
    emit('contextmenu', event)
  }
}
</script>

<template>
  <div
    class="bookmark-card group flex flex-col items-center cursor-pointer select-none relative"
    :class="{ 'edit-mode': isEditMode }"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <!-- 选中指示器 -->
    <Transition name="scale-fade">
      <div
        v-if="isEditMode"
        class="absolute -top-1 -right-1 z-10 size-5 rounded-full flex items-center justify-center transition-all duration-200"
        :class="isSelected
          ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
          : 'bg-white/20 border border-white/30'
        "
      >
        <Check
          v-if="isSelected"
          class="size-3 text-white"
        />
      </div>
    </Transition>

    <!-- 图标容器 -->
    <div
      class="size-14 rounded-2xl glass flex items-center justify-center mb-2 transition-all duration-200"
      :class="[
        isEditMode
          ? isSelected
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent scale-95'
            : 'opacity-80 hover:opacity-100'
          : 'glass-hover group-hover:scale-105'
      ]"
    >
      <img
        :src="faviconUrl"
        :alt="item.title"
        class="size-8 rounded-lg"
        @error="
          ;($event.target as HTMLImageElement).src =
            faviconService.generateDefaultIcon(item.title)
        "
      />
    </div>

    <!-- 标题 -->
    <span
      class="text-xs text-center line-clamp-2 max-w-[72px] text-shadow transition-all duration-200"
      :class="isSelected ? 'text-white' : 'text-white/80'"
    >
      {{ item.title }}
    </span>
  </div>
</template>

<style scoped>
.bookmark-card {
  touch-action: manipulation;
}

.bookmark-card.edit-mode {
  animation: wiggle 0.3s ease-in-out;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-1deg); }
  75% { transform: rotate(1deg); }
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.2s ease;
}

.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
