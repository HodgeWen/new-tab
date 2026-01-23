<template>
  <Dialog v-model:open="visible">
    <DialogContent
      class="glass-dialog max-w-md p-0 text-white border-white/20 bg-black/40 backdrop-blur-xl"
    >
      <DialogHeader class="px-6 py-4 border-b border-white/10">
        <DialogTitle class="text-lg font-semibold text-white">
          {{ isEdit ? '编辑网站' : '添加网站' }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ isEdit ? '编辑网站的名称和网址' : '添加新网站到新标签页' }}
        </DialogDescription>
      </DialogHeader>

      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <div class="flex items-center gap-4 p-4 rounded-xl bg-white/5">
          <div
            class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <img
              v-if="form.favicon"
              :src="form.favicon"
              class="w-8 h-8 rounded"
              @error="form.favicon = ''"
            />
            <Globe v-else class="size-6 text-white/50" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white truncate">{{ form.title || '网站名称' }}</p>
            <p class="text-xs text-white/50 truncate">
              {{ form.url || 'https://example.com' }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm text-white/70">网址</label>
          <Input
            v-model="form.url"
            type="text"
            placeholder="https://example.com"
            class="bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
            @blur="handleUrlChange"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm text-white/70">名称</label>
          <Input
            v-model="form.title"
            type="text"
            placeholder="网站名称"
            class="bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
          />
        </div>

        <div class="flex gap-3 pt-2">
          <Button
            type="button"
            variant="glass"
            class="flex-1"
            @click="closeModal"
          >
            取消
          </Button>
          <Button
            type="submit"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            :disabled="loading || !form.title.trim() || !form.url.trim()"
          >
            {{ loading ? '保存中...' : isEdit ? '保存' : '添加' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useModal } from '@/composables/use-modal'
import { useGridItemStore } from '@/stores/grid-items'
import type { SiteForm } from '@/types'
import { faviconService } from '@/services/favicon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shadcn/ui/dialog'
import { Button } from '@/shadcn/ui/button'
import { Input } from '@/shadcn/ui/input'
import { Globe } from 'lucide-vue-next'

defineOptions({ name: 'SiteEdit' })

const { visible, form, open } = useModal<SiteForm>({
  title: '',
  url: '',
  favicon: '',
  pid: null,
  id: null
})

const gridItemStore = useGridItemStore()
const loading = ref(false)
const isEdit = computed(() => Boolean(form.id))

function closeModal() {
  visible.value = false
}

function handleUrlChange() {
  if (!form.url) return

  try {
    let fullUrl = form.url
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`
      form.url = fullUrl
    }

    if (!form.title) {
      try {
        const domain = new URL(fullUrl).hostname.replace('www.', '')
        form.title = domain.charAt(0).toUpperCase() + domain.slice(1).split('.')[0]
      } catch {
        // 忽略解析错误
      }
    }

    form.favicon = faviconService.getFaviconUrl(fullUrl)
  } catch {
    // 忽略错误
  }
}

async function handleSubmit() {
  if (!form.title.trim() || !form.url.trim()) return

  loading.value = true
  try {
    let fullUrl = form.url
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`
    }

    const favicon = form.favicon || faviconService.getFaviconUrl(fullUrl)

    if (form.id) {
      await gridItemStore.updateGridItem(form.id, {
        title: form.title.trim(),
        url: fullUrl,
        favicon
      })
    } else {
      await gridItemStore.addSite({
        title: form.title.trim(),
        url: fullUrl,
        favicon,
        pid: form.pid
      })
    }
    closeModal()
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>
