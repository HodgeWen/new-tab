<template>
  <n-modal v-model="visible" :title="folder?.title || '文件夹'" width="680px" close-on-overlay>
    <div class="folder-view-content">
      <div v-if="sites.length === 0" class="empty-state">
        <span class="empty-text">文件夹为空</span>
        <n-button variant="ghost" size="sm" @click="handleAddSite">添加网站</n-button>
      </div>

      <div v-else class="sites-grid">
        <n-site-item
          v-for="site in sites"
          :key="site.id"
          :item="site"
          :in-folder="true"
          class="folder-site-item"
        />
        <!-- Add button as the last item in the grid -->
        <button class="add-site-btn" @click="handleAddSite">
          <plus :size="24" />
        </button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { NModal } from '@/components/modal'
import { NButton } from '@/components/button'
import { NSiteItem } from '@/components/site-item'
import { gridItems } from '@/store/grid-items'
import { components } from '@/store/components'
import type { FolderItemUI } from '@/types/ui'

defineOptions({ name: 'NFolderView' })

const visible = ref(false)
const folderId = ref<string | null>(null)

/** 从响应式 gridItems 中查找文件夹，确保 sites 更新时自动响应 */
const folder = computed(() => {
  if (!folderId.value) return null
  return gridItems.value.find((i) => i.id === folderId.value) as FolderItemUI | undefined
})

/** 文件夹子站点直接从 folder.sites 获取（syncList 已填充） */
const sites = computed(() => {
  return folder.value?.sites ?? []
})

function open(id: string) {
  folderId.value = id
  visible.value = true
}

function close() {
  visible.value = false
  folderId.value = null
}

function handleAddSite() {
  if (!folderId.value) return
  // Open site modal with pid pre-filled
  components.site?.open({ pid: folderId.value })
}

defineExpose({ open, close })
</script>

<style scoped>
.folder-view-content {
  --folder-grid-item-size: 80px;
  --folder-add-btn-size: 60px;
  min-height: 200px;
  padding: var(--spacing-sm);
}

.empty-state {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.empty-text {
  font-size: var(--text-body);
}

.sites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--folder-grid-item-size), 1fr));
  gap: var(--spacing-lg);
  justify-items: center;
}

.folder-site-item {
  width: var(--folder-grid-item-size);
  height: var(--folder-grid-item-size);
}

.add-site-btn {
  width: var(--folder-add-btn-size);
  height: var(--folder-add-btn-size);
  border-radius: var(--radius-md);
  border: 1px dashed var(--glass-border-strong);
  background: var(--glass-bg);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--spacing-sm);
}

.add-site-btn:hover {
  background: var(--glass-bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
