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
  readonly id: string
  /** 提供者显示名称 */
  readonly name: string
  /** 是否支持分类选择 */
  readonly supportsCategory: boolean

  /**
   * 获取支持的分类列表
   * 如果 supportsCategory 为 false，返回空数组
   */
  getCategories(): WallpaperCategory[]

  /**
   * 获取随机壁纸
   * @param category 分类（可选，仅支持分类的提供者使用）
   */
  getRandomPhoto(category?: string): Promise<WallpaperInfo | null>
}

/**
 * Bing 每日壁纸提供者
 * 使用 Peapix Feed API，提供高质量历史壁纸
 */
export class BingWallpaperProvider implements WallpaperProvider {
  readonly id = 'bing'
  readonly name = 'Bing 每日壁纸'
  readonly supportsCategory = false

  private readonly apiUrl = 'https://peapix.com/bing/feed'

  getCategories(): WallpaperCategory[] {
    return []
  }

  async getRandomPhoto(): Promise<WallpaperInfo | null> {
    try {
      const response = await fetch(this.apiUrl)
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
}

/**
 * Picsum 随机图片提供者
 * 作为备用壁纸源，可靠性高
 */
export class PicsumWallpaperProvider implements WallpaperProvider {
  readonly id = 'picsum'
  readonly name = 'Picsum 随机图片'
  readonly supportsCategory = false

  getCategories(): WallpaperCategory[] {
    return []
  }

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
}
