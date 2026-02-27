import { ref, watch, type Ref } from 'vue'
import type { SiteItemForm } from '@/types/ui'

const ICON_FETCH_TIMEOUT_MS = 3000

type SiteIconOptions = {
  form: SiteItemForm
  visible: Ref<boolean>
}

export function useSiteIcon({ form, visible }: SiteIconOptions) {
  const fetchingIcon = ref(false)
  let latestIconRequestId = 0

  function resetIconRequestState() {
    latestIconRequestId += 1
    fetchingIcon.value = false
  }

  watch(visible, (value) => {
    if (value) return
    resetIconRequestState()
  })

  async function handleUrlChange(rawUrl: string | number) {
    if (typeof rawUrl !== 'string') return

    const inputUrl = rawUrl.trim()
    if (!inputUrl) {
      latestIconRequestId += 1
      return
    }

    const validatedUrl = normalizeAndValidate(inputUrl)
    if (!validatedUrl) return

    const hasOriginalTitle = form.title.trim() !== ''
    const hasOriginalIcon = form.icon.trim() !== ''

    if (form.url !== validatedUrl) {
      form.url = validatedUrl
    }

    const parsedUrl = parseUrl(validatedUrl)
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

  function canApplyIconResult(requestId: number) {
    return requestId === latestIconRequestId && form.icon.trim() === '' && visible.value
  }

  return { fetchingIcon, handleUrlChange, resetIconRequestState, normalizeAndValidate }
}

/**
 * Parse and validate URL; only allow http: and https:.
 * Must parse raw input first — never normalize before protocol check.
 * "javascript:alert(1)" must be rejected because parsed.protocol is "javascript:".
 */
export function normalizeAndValidate(urlString: string): string | null {
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

/** 从 hostname 中提取主域名名称，如 www.baidu.com.cn → baidu */
function extractDomainName(hostname: string): string {
  const cleanHostname = hostname
    .toLowerCase()
    .replace(/\.+$/, '')
    .replace(/^www\./, '')
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
export async function fetchFaviconAsBase64(url: URL, size = 64): Promise<string> {
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

export function generateTextIconBase64(text: string, seed: string, size = 64): string {
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
