<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { X } from 'lucide-vue-next'

defineOptions({ name: 'NInput' })

const {
  type = 'text',
  placeholder,
  disabled = false,
  clearable = false,
  status = 'default'
} = defineProps<{
  type?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  status?: 'default' | 'error' | 'success'
}>()

const modelValue = defineModel<string | number>({ default: '' })

const emits = defineEmits<{
  change: [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
  enter: []
}>()

const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const focused = ref(false)

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emits('change', target.value)
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emits('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  emits('blur', event)
}

const handleClear = () => {
  modelValue.value = ''
  emits('clear')
  inputRef.value?.focus()
}

const handleEnter = () => {
  emits('enter')
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<template>
  <div
    class="input-wrapper"
    :class="[
      { disabled, focused },
      status !== 'default' ? `status-${status}` : ''
    ]"
  >
    <div v-if="$slots.prefix" class="prefix">
      <slot name="prefix" />
    </div>

    <input
      ref="inputRef"
      class="input"
      :type="type"
      v-model="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.enter="handleEnter"
    />

    <div v-if="clearable && modelValue && !disabled" class="clear-btn" @click="handleClear">
      <X :size="14" />
    </div>

    <div v-if="$slots.suffix" class="suffix">
      <slot name="suffix" />
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 var(--spacing-md);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  color: var(--text-primary);
}

.input-wrapper:hover:not(.disabled) {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-strong);
}

.input-wrapper.focused {
  background: var(--glass-bg-active);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-subtle);
}

.input-wrapper.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--glass-bg-disabled);
}

.input-wrapper.status-error {
  border-color: var(--color-danger);
}

.input-wrapper.status-error.focused {
  box-shadow: 0 0 0 2px var(--color-danger-subtle);
}

.input {
  flex: 1;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-family: inherit;
  font-size: var(--text-body);
  padding: 0;
  margin: 0;
}

.input::placeholder {
  color: var(--text-muted);
}

.prefix,
.suffix {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.prefix {
  margin-right: var(--spacing-sm);
}

.suffix {
  margin-left: var(--spacing-sm);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: var(--spacing-sm);
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
}
</style>
