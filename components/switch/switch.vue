<script setup lang="ts">
defineOptions({ name: 'NSwitch' })

const {
  disabled = false,
  loading = false
} = defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

const modelValue = defineModel<boolean>({ required: true })

const emits = defineEmits<{
  change: [value: boolean]
}>()

const toggle = () => {
  if (disabled || loading) return
  modelValue.value = !modelValue.value
  emits('change', modelValue.value)
}
</script>

<template>
  <div
    class="switch"
    :class="[
      { checked: modelValue, disabled }
    ]"
    @click="toggle"
  >
    <div class="switch-handle">
      <div v-if="loading" class="spinner"></div>
    </div>
    <input
      type="checkbox"
      class="switch-input"
      :checked="modelValue"
      :disabled="disabled"
      @click.stop
    />
  </div>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  
  /* Default size (previously md) */
  width: 44px;
  height: 24px;
}

.switch.checked {
  background: var(--color-primary);
  border-color: transparent;
}

.switch.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition-spring);
  
  /* Default size (previously md) */
  width: 20px;
  height: 20px;
  transform: translateX(2px);
}

.switch.checked .switch-handle {
  transform: translateX(22px);
}

/* Loading Spinner */
.spinner {
  width: 60%;
  height: 60%;
  border: 2px solid var(--color-primary);
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
