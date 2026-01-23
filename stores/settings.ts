import { defineStore } from 'pinia'
import { ref, toRaw, watch } from 'vue'
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
  function loadFromStorage(): Settings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        return deepMergeSettings(defaultSettings, JSON.parse(raw))
      }
    } catch (error) {
      console.error('[Settings] Failed to load settings:', error)
    }
    return structuredClone(defaultSettings)
  }

  const settings = ref<Settings>(loadFromStorage())

  watch(
    settings,
    value => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toRaw(value)))
      } catch (error) {
        console.error('[Settings] Failed to save settings:', error)
      }
    },
    { deep: true }
  )

  return {
    settings
  }
})
