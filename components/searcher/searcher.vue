<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { NInput } from '@/components/input'

defineOptions({ name: 'NSearcher' })

const query = ref('')

function handleSearch() {
  if (!query.value.trim()) return
  // 使用谷歌搜索
  window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query.value)}`
}
</script>

<template>
  <div class="searcher">
    <NInput
      v-model="query"
      class="search-input"
      placeholder="搜索..."
      clearable
      @enter="handleSearch"
    >
      <template #prefix>
        <Search :size="18" class="search-icon" />
      </template>
    </NInput>
  </div>
</template>

<style scoped>
.searcher {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  margin-bottom: var(--spacing-xl);
  transition: all var(--transition-normal);
}

.searcher:focus-within {
  max-width: 520px;
  transform: translateY(-2px);
}

:deep(.input-wrapper) {
  height: 48px; /* 比标准输入框稍大 */
  border-radius: var(--radius-full); /* 全圆角 */
  background: var(--glass-bg);
  box-shadow: var(--glass-shadow-subtle);
}

:deep(.input-wrapper:hover) {
  background: var(--glass-bg-hover);
  box-shadow: var(--glass-shadow);
}

:deep(.input-wrapper.focused) {
  background: var(--glass-bg-active);
  box-shadow: var(--glass-shadow-elevated);
  border-color: var(--glass-border-strong);
}

:deep(.input) {
  font-size: var(--text-title); /* 稍大的文字 */
}

.search-icon {
  color: var(--text-secondary);
}
</style>
