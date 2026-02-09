import { onUnmounted, ref, watch, type WatchStopHandle } from 'vue'
import { setting } from '@/store/setting'
import { getWallpaperProvider } from '@/utils/wallpaper-providers'
import { db } from '@/utils/db'
import type { WallpaperRequestOptions } from '@/types/common'

const wallpaperUrl = ref('')
const loading = ref(false)

let refreshTimer: ReturnType<typeof setTimeout> | null = null
let currentBlobUrl: string | null = null
let stopSettingWatch: WatchStopHandle | null = null
let consumers = 0
let currentWallpaperId = ''
const pendingRevokeTimers = new Set<ReturnType<typeof setTimeout>>()

const canRefresh = ref(false)

const BLOB_REVOKE_DELAY = 1200

function setUrl(url: string) {
  if (url === wallpaperUrl.value) return

  const previousBlobUrl = currentBlobUrl
  currentBlobUrl = url.startsWith('blob:') ? url : null
  wallpaperUrl.value = url

  if (previousBlobUrl && previousBlobUrl !== currentBlobUrl) {
    const timer = setTimeout(() => {
      URL.revokeObjectURL(previousBlobUrl)
      pendingRevokeTimers.delete(timer)
    }, BLOB_REVOKE_DELAY)
    pendingRevokeTimers.add(timer)
  }
}

async function fetchAndCache(options?: WallpaperRequestOptions): Promise<boolean> {
  const provider = getWallpaperProvider(setting.wallpaperProvider)
  if (!provider) return false

  loading.value = true
  try {
    const info = await provider.getWallpaper(options)
    if (!wallpaperUrl.value) {
      setUrl(info.url)
    }

    const res = await fetch(info.downloadUrl)
    if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)

    const blob = await res.blob()
    await db.saveWallpaper('current', info, blob)
    currentWallpaperId = info.id
    setUrl(URL.createObjectURL(blob))
    return true
  } catch (err) {
    console.error('[Wallpaper] Fetch failed:', err)
    return false
  } finally {
    loading.value = false
  }
}

async function loadWallpaper() {
  if (!setting.wallpaper || !setting.wallpaperProvider) {
    setUrl('')
    clearTimer()
    return
  }

  clearTimer()
  canRefresh.value = !!getWallpaperProvider(setting.wallpaperProvider)?.refreshable

  try {
    const cached = await db.getWallpaper('current')
    if (cached) {
      currentWallpaperId = cached.wallpaper.id
      setUrl(cached.blobUrl)

      const elapsed = Date.now() - cached.timestamp
      if (elapsed < setting.wallpaperInterval) {
        scheduleRefresh(setting.wallpaperInterval - elapsed)
        return
      }
    }
  } catch {
    // IndexedDB 可能不可用，忽略
  }

  await fetchAndCache()
  scheduleRefresh(setting.wallpaperInterval)
}

async function refreshWallpaper() {
  if (!setting.wallpaper || !setting.wallpaperProvider) return false

  const provider = getWallpaperProvider(setting.wallpaperProvider)
  if (!provider?.refreshable) return false

  clearTimer()
  const ok = await fetchAndCache({
    force: true,
    excludeId: currentWallpaperId || undefined
  })
  scheduleRefresh(setting.wallpaperInterval)
  return ok
}

function scheduleRefresh(delay: number) {
  clearTimer()
  if (delay > 0 && setting.wallpaperInterval > 0) {
    refreshTimer = setTimeout(async () => {
      await fetchAndCache()
      scheduleRefresh(setting.wallpaperInterval)
    }, delay)
  }
}

function clearTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

function initWallpaper() {
  if (stopSettingWatch) return

  stopSettingWatch = watch(
    () => [setting.wallpaper, setting.wallpaperProvider, setting.wallpaperInterval] as const,
    () => {
      void loadWallpaper()
    }
  )

  void loadWallpaper()
}

function destroyWallpaper() {
  clearTimer()
  if (stopSettingWatch) {
    stopSettingWatch()
    stopSettingWatch = null
  }

  for (const timer of pendingRevokeTimers) {
    clearTimeout(timer)
  }
  pendingRevokeTimers.clear()

  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
}

export function useWallpaper() {
  consumers += 1
  initWallpaper()

  onUnmounted(() => {
    consumers -= 1
    if (consumers <= 0) {
      consumers = 0
      destroyWallpaper()
    }
  })

  return { wallpaperUrl, loading, canRefresh, refreshWallpaper }
}
