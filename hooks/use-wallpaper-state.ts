import { ref, watch, type Ref, type WatchStopHandle } from 'vue'
import { setting } from '@/store/setting'

const BLOB_REVOKE_DELAY = 1200

const wallpaperUrl = ref('')
const loading = ref(false)
const canRefresh = ref(false)

let refreshTimer: ReturnType<typeof setTimeout> | null = null
let currentBlobUrl: string | null = null
let currentWallpaperId = ''
let stopSettingWatch: WatchStopHandle | null = null
const pendingRevokeTimers = new Set<ReturnType<typeof setTimeout>>()

export type WallpaperState = {
  wallpaperUrl: Ref<string>
  loading: Ref<boolean>
  canRefresh: Ref<boolean>
  setLoading: (value: boolean) => void
  setCanRefresh: (value: boolean) => void
  setUrl: (url: string) => void
  getCurrentWallpaperId: () => string
  setCurrentWallpaperId: (id: string) => void
  scheduleRefresh: (delay: number, task: () => void | Promise<void>) => void
  clearTimer: () => void
  init: (onSettingChange: () => void | Promise<void>) => void
  destroy: () => void
}

export function createWallpaperState(): WallpaperState {
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

  function setLoading(value: boolean) {
    loading.value = value
  }

  function setCanRefresh(value: boolean) {
    canRefresh.value = value
  }

  function getCurrentWallpaperId() {
    return currentWallpaperId
  }

  function setCurrentWallpaperId(id: string) {
    currentWallpaperId = id
  }

  function clearTimer() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  function scheduleRefresh(delay: number, task: () => void | Promise<void>) {
    clearTimer()
    if (delay > 0 && setting.wallpaperInterval > 0) {
      refreshTimer = setTimeout(() => {
        void task()
      }, delay)
    }
  }

  function init(onSettingChange: () => void | Promise<void>) {
    if (stopSettingWatch) return

    stopSettingWatch = watch(
      () => [setting.wallpaper, setting.wallpaperProvider, setting.wallpaperInterval] as const,
      () => {
        void onSettingChange()
      }
    )

    void onSettingChange()
  }

  function destroy() {
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

  return {
    wallpaperUrl,
    loading,
    canRefresh,
    setLoading,
    setCanRefresh,
    setUrl,
    getCurrentWallpaperId,
    setCurrentWallpaperId,
    scheduleRefresh,
    clearTimer,
    init,
    destroy
  }
}
