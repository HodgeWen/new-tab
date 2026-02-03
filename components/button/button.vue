<template>
  <button class="button">
    <component :is="icon" v-if="icon" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
defineOptions({ name: 'NButton' })

defineProps<{ icon?: Component }>()
</script>
