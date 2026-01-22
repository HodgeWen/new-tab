import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import type { Settings } from '@/types'

const STORAGE_KEY = 'new-tab-settings'

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

  function loadSettings() {
    loading.value = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        settings.value = deepMergeSettings(defaultSettings, JSON.parse(raw))
      } else {
        // 首次运行，保存默认设置
        saveSettings()
      }
    } catch (error) {
      console.error('[Settings] Failed to load settings:', error)
      // 出错时重置为默认值
      settings.value = structuredClone(defaultSettings)
    } finally {
      loading.value = false
    }
  }

  function saveSettings() {
    try {
      // 使用 toRaw 获取原始对象
      const rawSettings = toRaw(settings.value)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawSettings))
    } catch (error) {
      console.error('[Settings] Failed to save settings:', error)
    }
  }

  function toggleSearchBar() {
    settings.value.showSearchBar = !settings.value.showSearchBar
    saveSettings()
  }

  function updateSettings(config: Partial<Settings>) {
    Object.assign(settings.value, config)
    saveSettings()
  }

  function updateWallpaperSettings(
    config: Partial<Settings['wallpaper']>
  ) {
    Object.assign(settings.value.wallpaper, config)
    saveSettings()
  }

  function updateWebDAVSettings(config: Partial<Settings['webdav']>) {
    Object.assign(settings.value.webdav, config)
    saveSettings()
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
