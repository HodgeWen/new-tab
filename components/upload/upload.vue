<script setup lang="ts">
defineOptions({ name: 'NUpload' })

const { accept = 'image/*', sizeLimit, disabled = false } = defineProps<{
  accept?: string
  multiple?: boolean
  /** 文件大小上限（单位：字节） */
  sizeLimit?: number
  disabled?: boolean
}>()

const emit = defineEmits<{ pick: [file: File] }>()

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
  <label :class="{ disabled }">
    <slot />
    <input
      type="file"
      hidden
      :accept="accept"
      :multiple="multiple"
      class="hidden-input"
      @change="handleChange"
    />
  </label>
</template>

<style scoped>
.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

label.disabled {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
