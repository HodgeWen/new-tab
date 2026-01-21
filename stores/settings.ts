import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import type { Settings } from '@/types'
import { db } from '@/services/database'

const defaultSettings: Settings = {
  showSearchBar: false,
  webdav: {
    enabled: false,
    url: '',
    username: '',
    password: ''
  },
  wallpaper: {
    enabled: true,
    interval: 30, // 30 分钟
    category: '',
    source: 'bing'
  }
}

/** 深度合并设置，确保嵌套对象也正确合并 */
function deepMergeSettings(
  defaults: Settings,
  saved: Partial<Settings>
): Settings {
  return {
    showSearchBar: saved.showSearchBar ?? defaults.showSearchBar,
    webdav: {
      ...defaults.webdav,
      ...saved.webdav
    },
    wallpaper: {
      ...defaults.wallpaper,
      ...saved.wallpaper
    }
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(structuredClone(defaultSettings))
  const loading = ref(false)

  async function loadSettings() {
    loading.value = true
    try {
      const saved = await db.getSettings()
      if (saved) {
        settings.value = deepMergeSettings(defaultSettings, saved)
      } else {
        // 首次运行，保存默认设置到数据库
        await saveSettings()
      }
    } catch (error) {
      console.error('[Settings] Failed to load settings:', error)
    } finally {
      loading.value = false
    }
  }

  async function saveSettings() {
    try {
      // 使用 toRaw 获取原始对象，避免 IndexedDB 无法克隆 Proxy 对象的问题
      const rawSettings = JSON.parse(JSON.stringify(toRaw(settings.value)))

      await db.saveSettings(rawSettings)
    } catch (error) {
      console.error('[Settings] Failed to save settings:', error)
    }
  }

  async function toggleSearchBar() {
    settings.value.showSearchBar = !settings.value.showSearchBar
    await saveSettings()
  }

  async function updateSettings(config: Partial<Settings>) {
    Object.assign(settings.value, config)
    await saveSettings()
  }

  async function updateWallpaperSettings(
    config: Partial<Settings['wallpaper']>
  ) {
    Object.assign(settings.value.wallpaper, config)
    await saveSettings()
  }

  async function updateWebDAVSettings(config: Partial<Settings['webdav']>) {
    Object.assign(settings.value.webdav, config)
    await saveSettings()
  }

  return {
    settings,
    loading,
    loadSettings,
    saveSettings,
    toggleSearchBar,
    updateSettings,
    updateWallpaperSettings,
    updateWebDAVSettings
  }
})
