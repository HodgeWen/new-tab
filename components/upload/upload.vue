<script setup lang="ts">
import { useTemplateRef } from 'vue'

defineOptions({ name: 'NUpload' })

const { accept = 'image/*', multiple = false, sizeLimit, disabled = false } = defineProps<{
  accept?: string
  multiple?: boolean
  /** 文件大小上限（单位：字节） */
  sizeLimit?: number
  disabled?: boolean
}>()

const emit = defineEmits<{ pick: [file: File] }>()
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')

function openPicker() {
  if (disabled) return
  inputRef.value?.click()
}

function handleKeydown(event: KeyboardEvent) {
  if (disabled) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openPicker()
  }
}

function handleChange(event: Event) {
  if (disabled) return
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 文件大小校验（sizeLimit 单位为字节）
  if (sizeLimit && file.size > sizeLimit) {
    target.value = ''
    return
  }

  emit('pick', file)

  // 重置 input 以便再次选择同一文件
  target.value = ''
}
</script>

<template>
  <div
    class="upload-trigger"
    :class="{ disabled }"
    role="button"
    :tabindex="disabled ? -1 : 0"
    @click="openPicker"
    @keydown="handleKeydown"
  >
    <slot />
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden-input"
      @change="handleChange"
    />
  </div>
</template>

<style scoped>
.upload-trigger {
  position: relative;
  display: inline-flex;
}

.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.upload-trigger.disabled {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
