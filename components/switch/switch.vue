<template>
  <div class="switch">
    <input type="checkbox" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NSwitch' })

const props = defineProps<{ modelValue: boolean }>()

const emits = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
</script>
