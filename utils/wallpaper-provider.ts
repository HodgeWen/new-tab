import type { WallpaperInfo } from '@/types'

/**
 * 壁纸分类
 */
export interface WallpaperCategory {
  value: string
  label: string
}

/**
 * 壁纸提供者接口
 * 所有壁纸源（Bing、Picsum 等）都需要实现此接口
 */
export interface WallpaperProvider {
  /** 提供者唯一标识 */
  id: string
  /** 提供者显示名称 */
  name: string
  /**
   * 分类列表
   * 如果未提供，则认为不支持分类
   */
  categories?: WallpaperCategory[]

  /**
   * 获取随机壁纸
   * @param category 分类（可选，仅支持分类的提供者使用）
   */
  getRandomPhoto(category?: string): Promise<WallpaperInfo | null>
}

function defineWallpaperProvider(
  provider: WallpaperProvider
): WallpaperProvider {
  return provider
}

export const BingWallpaperProvider = defineWallpaperProvider({
  id: 'bing',
  name: 'Bing 每日壁纸',
  async getRandomPhoto() {
    try {
      const response = await fetch('https://peapix.com/bing/feed')
      if (!response.ok) {
        throw new Error(`Bing API responded with status ${response.status}`)
      }

      const data = await response.json()
      if (!Array.isArray(data) || data.length === 0) {
        return null
      }

      // 随机选择一张
      const photo = data[Math.floor(Math.random() * data.length)]
      const timestamp = Date.now()

      return {
        id: `bing-${photo.date}-${timestamp}`,
        url: photo.fullUrl,
        thumbUrl: photo.thumbUrl,
        author: photo.copyright,
        authorUrl: photo.copyrightUrl || 'https://bing.com',
        downloadUrl: photo.fullUrl
      }
    } catch (error) {
      console.error('[BingProvider] Failed to fetch wallpaper:', error)
      return null
    }
  }
})

/**
 * Picsum 随机图片提供者
 */

export const PicsumWallpaperProvider = defineWallpaperProvider({
  id: 'picsum',
  name: 'Picsum 随机图片',
  async getRandomPhoto(): Promise<WallpaperInfo | null> {
    const timestamp = Date.now()
    // 使用固定范围的随机 ID 以确保获取有效图片
    const randomId = Math.floor(Math.random() * 100) + 1

    return {
      id: `picsum-${randomId}-${timestamp}`,
      url: `https://picsum.photos/id/${randomId}/1920/1080`,
      thumbUrl: `https://picsum.photos/id/${randomId}/400/300`,
      author: 'Picsum',
      authorUrl: 'https://picsum.photos',
      downloadUrl: `https://picsum.photos/id/${randomId}/1920/1080`
    }
  }
})
