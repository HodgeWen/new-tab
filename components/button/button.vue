<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { Component } from 'vue'
import { computed, useSlots } from 'vue'

defineOptions({ name: 'NButton' })

const {
  variant = 'glass',
  loading = false,
  block = false,
  disabled = false,
  icon,
  square = false
} = defineProps<{
  variant?: 'primary' | 'danger' | 'warning' | 'success' | 'glass' | 'ghost'
  icon?: Component
  loading?: boolean
  block?: boolean
  disabled?: boolean
  square?: boolean
}>()

const emits = defineEmits<{ click: [event: MouseEvent] }>()

const slots = useSlots()

const isSquare = computed(() => {
  if (square) return true
  // If explicitly has icon prop and no default slot content, treat as square icon button
  if (icon && !slots.default) return true
  return false
})

const handleClick = (event: MouseEvent) => {
  if (!disabled && !loading) {
    emits('click', event)
  }
}
</script>

<template>
  <button
    class="button"
    :class="[`variant-${variant}`, { block, loading, 'is-square': isSquare, 'has-icon': !!icon }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <Loader2 v-if="loading" class="spinner" />
    <component :is="icon" v-else-if="icon" class="icon" />
    <slot />
  </button>
</template>

<style scoped>
.button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  height: 40px;
  padding: 0 var(--spacing-lg);
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--text-body);
  font-weight: var(--font-medium);
  white-space: nowrap;
  transition: all var(--transition-spring);
  user-select: none;
  text-decoration: none;
  border-radius: var(--radius-md);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button:active:not(:disabled) {
  transform: scale(0.97);
}

/* Square variant (icon-only) */
.is-square {
  width: 40px;
  padding: 0;
  border-radius: var(--radius-md);
}

.block {
  width: 100%;
  display: flex;
}

/* Variants */
.variant-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-color: var(--glass-border);
  color: var(--text-primary);
  box-shadow: var(--glass-shadow-subtle);
}

.variant-glass:hover:not(:disabled) {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-strong);
  box-shadow: var(--glass-shadow);
}

.variant-glass:active:not(:disabled) {
  background: var(--glass-bg-active);
  transform: translateY(0) scale(0.97);
}

.variant-primary {
  background: var(--color-primary);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px var(--color-primary-subtle);
}

.variant-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--color-primary-subtle);
}

.variant-danger {
  background: var(--color-danger);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px var(--color-danger-subtle);
}

.variant-danger:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.variant-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--text-primary);
}

.variant-ghost:hover:not(:disabled) {
  background: var(--glass-bg);
}

/* Icon */
.icon {
  width: 1.2em;
  height: 1.2em;
}

/* Spinner */
.spinner {
  width: 1em;
  height: 1em;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
