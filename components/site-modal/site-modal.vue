<template>
  <n-modal :title="isEdit ? '编辑网站' : '添加网站'" v-model="visible" width="420px">
    <div class="site-form">
      <!-- 图标上传 -->
      <div class="icon-section">
        <n-upload class="icon-upload" :class="{ 'has-icon': form.icon }" @pick="handleIconUpload">
          <img v-if="form.icon" :src="form.icon" class="icon-preview" alt="网站图标" />
          <div v-else-if="fetchingIcon" class="icon-placeholder icon-loading">
            <Loader2 :size="24" class="icon-spinner" />
            <span>获取中</span>
          </div>
          <div v-else class="icon-placeholder">
            <ImagePlus :size="24" />
            <span>上传图标</span>
          </div>
        </n-upload>
        <n-button
          v-if="form.icon"
          variant="ghost"
          class="remove-icon-btn"
          @click="handleRemoveIcon"
        >
          移除图标
        </n-button>
      </div>

      <!-- 网址 -->
      <div class="form-item">
        <label>网址</label>
        <n-input v-model="form.url" @change="handleUrlChange" placeholder="https://example.com" clearable :status="urlStatus">
          <template #prefix>
            <Globe :size="16" />
          </template>
        </n-input>
      </div>

      <!-- 标题 -->
      <div class="form-item">
        <label>标题</label>
        <n-input v-model="form.title" placeholder="输入网站名称" clearable />
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <n-button variant="ghost" @click="visible = false">取消</n-button>
        <n-button variant="primary" @click="handleSave" :disabled="!canSave">
          {{ isEdit ? '保存' : '添加' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ImagePlus, Globe, Loader2 } from 'lucide-vue-next'
import { NModal } from '@/components/modal'
import { NInput } from '@/components/input'
import { NButton } from '@/components/button'
import { NUpload } from '@/components/upload'
import { useModal } from '@/hooks/use-modal'
import { nanoid } from 'nanoid'
import { components } from '@/store/components'
import { addGridItem, updateGridItem } from '@/store/grid-items'
import type { SiteItemForm, SiteItemUI } from '@/types/ui'

defineOptions({ name: 'NSiteModal' })

const ICON_FETCH_TIMEOUT_MS = 3000

const {
  form,
  open: openModal,
  visible
} = useModal<SiteItemForm>({ type: 'site', id: null, title: '', url: '', icon: '', pid: null })

const isEdit = computed(() => !!form.id)
const fetchingIcon = ref(false)
let latestIconRequestId = 0

const canSave = computed(() => {
  return form.title.trim() !== '' && form.url.trim() !== '' && urlStatus.value !== 'error'
})

const urlStatus = computed<'default' | 'error' | 'success'>(() => {
  const url = form.url.trim()
  if (!url) return 'default'
  return normalizeAndValidate(url) ? 'success' : 'error'
})

function open(data?: Partial<SiteItemForm>) {
  latestIconRequestId += 1
  openModal(data as SiteItemForm)
}

function handleIconUpload(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.icon = (e.target?.result as string) ?? ''
  }
  reader.readAsDataURL(file)
}

function handleRemoveIcon() {
  form.icon = ''
}

watch(visible, (value) => {
  if (value) return

  latestIconRequestId += 1
  fetchingIcon.value = false
})

async function handleUrlChange(rawUrl: string | number) {
  if (typeof rawUrl !== 'string') return

  const inputUrl = rawUrl.trim()
  if (!inputUrl) {
    latestIconRequestId += 1
    return
  }

  const hasOriginalTitle = form.title.trim() !== ''
  const hasOriginalIcon = form.icon.trim() !== ''

  const normalizedUrl = normalizeUrl(inputUrl)
  if (!normalizedUrl) return

  if (form.url !== normalizedUrl) {
    form.url = normalizedUrl
  }

  const parsedUrl = parseUrl(normalizedUrl)
  if (!parsedUrl) return

  if (!hasOriginalTitle) {
    form.title = extractDomainName(parsedUrl.hostname)
  }

  if (hasOriginalIcon) return

  const requestId = ++latestIconRequestId
  fetchingIcon.value = true

  try {
    const base64 = await fetchFaviconAsBase64(parsedUrl)
    if (base64 && canApplyIconResult(requestId)) {
      form.icon = base64
      return
    }
  } catch {
    // favicon 获取失败时走首字回退
  } finally {
    if (requestId === latestIconRequestId) {
      fetchingIcon.value = false
    }
  }

  if (!canApplyIconResult(requestId)) return

  const fallbackText = getFallbackIconText(form.title || extractDomainName(parsedUrl.hostname))
  if (!fallbackText) return

  form.icon = generateTextIconBase64(fallbackText, parsedUrl.hostname)
}

/**
 * Parse and validate URL; only allow http: and https:.
 * Must parse raw input first — never normalize before protocol check.
 * "javascript:alert(1)" must be rejected because parsed.protocol is "javascript:".
 */
function normalizeAndValidate(urlString: string): string | null {
  const trimmed = urlString.trim()
  if (!trimmed) return null
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    try {
      parsed = new URL(`https://${trimmed}`)
    } catch {
      return null
    }
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function canApplyIconResult(requestId: number) {
  return requestId === latestIconRequestId && form.icon.trim() === '' && visible.value
}

/** 从 hostname 中提取主域名名称，如 www.baidu.com.cn → baidu */
function extractDomainName(hostname: string): string {
  const cleanHostname = hostname.toLowerCase().replace(/\.+$/, '').replace(/^www\./, '')
  const parts = cleanHostname.split('.').filter(Boolean)

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!

  // 常见的双段后缀
  const twoPartTlds = [
    'com.cn',
    'com.hk',
    'com.tw',
    'com.au',
    'com.br',
    'com.sg',
    'co.uk',
    'co.jp',
    'co.kr',
    'org.cn',
    'net.cn',
    'gov.cn'
  ]
  const lastTwo = parts.slice(-2).join('.')
  if (twoPartTlds.includes(lastTwo) && parts.length >= 3) {
    return parts[parts.length - 3]!
  }

  return parts.length >= 2 ? parts[parts.length - 2]! : parts[0]!
}

/**
 * 获取网站 favicon 并转换为 base64
 * 利用浏览器扩展的 host_permissions 直接跨域 fetch，无需第三方服务
 */
async function fetchFaviconAsBase64(url: URL, size = 64): Promise<string> {
  const faviconPath = `/_favicon/?pageUrl=${encodeURIComponent(url.href)}&size=${size}`
  const faviconUrl = globalThis.chrome?.runtime?.getURL?.(faviconPath)

  if (!faviconUrl) {
    throw new Error('Browser favicon API is unavailable')
  }

  return imageUrlToBase64(faviconUrl, size)
}

function imageUrlToBase64(imageUrl: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    const timer = window.setTimeout(() => {
      img.onload = null
      img.onerror = null
      reject(new Error('Favicon fetch timeout'))
    }, ICON_FETCH_TIMEOUT_MS)

    img.onload = () => {
      window.clearTimeout(timer)

      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context unavailable'))
        return
      }

      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error('Favicon image load failed'))
    }

    img.src = imageUrl
  })
}

function getFallbackIconText(title: string): string {
  const firstChar = Array.from(title.trim())[0] ?? ''
  if (!firstChar) return ''

  return /^[a-zA-Z]$/.test(firstChar) ? firstChar.toUpperCase() : firstChar
}

function generateTextIconBase64(text: string, seed: string, size = 64): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const radius = Math.round(size * 0.22)
  drawRoundedRect(ctx, 0, 0, size, size, radius)
  ctx.fillStyle = colorFromSeed(seed)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'
  ctx.font = `600 ${Math.round(size * 0.48)}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, size / 2, size / 2)

  return canvas.toDataURL('image/png')
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.lineTo(x + width - safeRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  ctx.lineTo(x + width, y + height - safeRadius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  ctx.lineTo(x + safeRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  ctx.lineTo(x, y + safeRadius)
  ctx.quadraticCurveTo(x, y, x + safeRadius, y)
  ctx.closePath()
}

function colorFromSeed(seed: string): string {
  let hash = 0

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0
  }

  const hue = Math.abs(hash) % 360
  return `hsl(${hue}deg 65% 48%)`
}

function handleSave() {
  if (!canSave.value) return

  if (isEdit.value) {
    // 编辑模式：先更新 store 数据，再重新渲染
    updateGridItem({ ...form, id: form.id! } as SiteItemUI)
    components.gridLayout?.updateWidget(form.id!)
  } else {
    // 创建模式
    if (form.pid) {
      // 如果是在文件夹内创建
      const id = nanoid(10)
      addGridItem({ ...form, id } as SiteItemUI)
    } else {
      // 顶级网格创建：通过 GridStack 添加
      components.gridLayout?.addWidget({ ...form })
    }
  }

  visible.value = false
}

defineExpose({ open })
</script>

<style scoped>
.site-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xs) 0;
}

.icon-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.icon-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  border: 2px dashed var(--glass-border-strong);
  background: var(--glass-bg);
  cursor: pointer;
  transition: all var(--transition-normal);
  overflow: hidden;
  position: relative;
}

.icon-upload:hover {
  border-color: var(--color-primary);
  background: var(--glass-bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow);
}

.icon-upload.has-icon {
  border-style: solid;
  border-color: var(--glass-border);
}

.icon-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.icon-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-muted);
  font-size: var(--text-caption);
}

.icon-loading {
  color: var(--color-primary);
}

.icon-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.remove-icon-btn {
  font-size: var(--text-caption);
  height: 28px;
  padding: 0 var(--spacing-sm);
  color: var(--text-secondary);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-item > label {
  color: var(--text-primary);
  font-size: var(--text-body);
  font-weight: var(--font-medium);
}

.footer-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>
