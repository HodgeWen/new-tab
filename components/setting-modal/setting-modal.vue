<template>
  <n-modal title="设置" v-model="visible"> </n-modal>
</template>

<script setup lang="ts">
import { NModal } from '@/components/modal'
import { useModal } from '@/hooks/use-modal'

defineOptions({ name: 'NSettingModal' })

const { form, open, visible } = useModal({})

defineExpose({ open })
</script>
