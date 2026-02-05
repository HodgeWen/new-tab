<template>
  <button class="button" @click="emits('click', $event)">
    <component :is="icon" v-if="icon" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
defineOptions({ name: 'NButton' })

defineProps<{ icon?: Component }>()

const emits = defineEmits<{ (e: 'click', event: MouseEvent): void }>()
</script>
