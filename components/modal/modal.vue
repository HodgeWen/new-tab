<template>
  <div class="modal-overlay">
    <div class="modal">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NModal' })

defineProps<{ title?: string }>()

const visible = defineModel<boolean>()
</script>
