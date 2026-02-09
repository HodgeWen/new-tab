<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

defineOptions({ name: 'NSelect' })

interface Option {
  label: string
  value: any
  disabled?: boolean
}

const {
  options = [],
  placeholder = '请选择',
  disabled = false,
  width
} = defineProps<{
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  width?: string | number
}>()

const modelValue = defineModel<any>()

const emits = defineEmits<{ change: [value: any] }>()

const isOpen = ref(false)
const containerRef = useTemplateRef<HTMLElement>('containerRef')

const selectedOption = computed(() => {
  return options.find((opt) => opt.value === modelValue.value)
})

const toggleDropdown = () => {
  if (disabled) return
  isOpen.value = !isOpen.value
}

const selectOption = (option: Option) => {
  if (option.disabled) return
  modelValue.value = option.value
  emits('change', option.value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div
    class="select-container"
    ref="containerRef"
    :class="{ disabled, open: isOpen }"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
  >
    <div class="select-trigger" @click="toggleDropdown">
      <span v-if="selectedOption" class="selected-label">{{ selectedOption.label }}</span>
      <span v-else class="placeholder">{{ placeholder }}</span>
      <div class="arrow" :class="{ up: isOpen }">
        <ChevronDown :size="16" />
      </div>
    </div>

    <transition name="fade">
      <div v-if="isOpen" class="options-dropdown">
        <div
          v-for="option in options"
          :key="String(option.value)"
          class="option-item"
          :class="{ active: modelValue === option.value, disabled: option.disabled }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
        <div v-if="options.length === 0" class="no-data">无数据</div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.select-container {
  position: relative;
  display: inline-block;
  width: 100%;
  min-width: 120px;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding: 0 var(--spacing-md);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-primary);
  user-select: none;
}

.select-container:not(.disabled):hover .select-trigger {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-strong);
}

.select-container.open .select-trigger {
  background: var(--glass-bg-active);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-subtle);
}

.select-container.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.selected-label {
  font-size: var(--text-body);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder {
  color: var(--text-muted);
  font-size: var(--text-body);
}

.arrow {
  color: var(--text-secondary);
  transition: transform var(--transition-fast);
  display: flex;
  align-items: center;
}

.arrow.up {
  transform: rotate(180deg);
}

.options-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: rgba(30, 30, 30, 0.95); /* Better readability for dropdown */
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--glass-shadow-elevated);
  z-index: 100;
  padding: var(--spacing-xs);
}

/* Scrollbar */
.options-dropdown::-webkit-scrollbar {
  width: 6px;
}
.options-dropdown::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.option-item {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--text-body);
  transition: all var(--transition-fast);
}

.option-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.option-item.active {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: var(--font-medium);
}

.option-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-data {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--text-caption);
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
