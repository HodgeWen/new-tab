<template>
  <Dialog v-model:open="visible" class="site-modal">
    <DialogHeader> </DialogHeader>
    <DialogContent> </DialogContent>
    <DialogFooter>
      <Button @click="submit">提交</Button>
    </DialogFooter>
  </Dialog>
</template>

<script setup lang="ts">
import { useModal } from '@/composables/use-modal'
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter
} from '@/shadcn/ui/dialog'
import { useGridItemStore } from '@/stores/grid-items'
import type { SiteForm } from '@/types'
import { o } from '@cat-kit/core'
import { Button } from '@/shadcn/ui/button'

defineOptions({ name: 'SiteEdit' })

const { visible, form, open } = useModal<SiteForm>({
  title: '',
  url: '',
  favicon: '',
  pid: null,
  id: null
})

const gridItemStore = useGridItemStore()

function submit() {
  if (form.id) {
    gridItemStore.updateGridItem(form.id, o(form).omit(['id', 'pid']))
  } else {
    gridItemStore.addSite(form)
  }
}

defineExpose({ open })
</script>
