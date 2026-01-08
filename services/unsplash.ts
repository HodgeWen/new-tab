import type { WallpaperInfo } from '@/types'

interface PicsumPhoto {
  id: string
  author: string
  width: number
  height: number
  url: string
  download_url: string
}

/**
 * 壁纸服务 - 使用 Picsum Photos API（免费、稳定、无需 API Key）
 * 文档：https://picsum.photos/
 */
class WallpaperService {
  private readonly baseUrl = 'https://picsum.photos'
  private photoCache: PicsumPhoto[] = []

  /**
   * 获取随机图片信息
   */
  async getRandomPhoto(_category: string = 'nature'): Promise<WallpaperInfo | null> {
    try {
      // 如果缓存为空，先获取图片列表
      if (this.photoCache.length === 0) {
        await this.fetchPhotoList()
      }

      // 从缓存中随机选择一张
      if (this.photoCache.length === 0) {
        return this.getFallbackPhoto()
      }

      const randomIndex = Math.floor(Math.random() * this.photoCache.length)
      const photo = this.photoCache[randomIndex]
      const timestamp = Date.now()

      return {
        id: `picsum-${photo.id}-${timestamp}`,
        url: `${this.baseUrl}/id/${photo.id}/1920/1080`,
        thumbUrl: `${this.baseUrl}/id/${photo.id}/400/300`,
        author: photo.author,
        authorUrl: photo.url,
        downloadUrl: `${this.baseUrl}/id/${photo.id}/1920/1080`
      }
    } catch {
      return this.getFallbackPhoto()
    }
  }

  /**
   * 获取图片列表
   */
  private async fetchPhotoList(): Promise<void> {
    try {
      // 获取多页图片以增加随机性
      const page = Math.floor(Math.random() * 10) + 1
      const response = await fetch(`${this.baseUrl}/v2/list?page=${page}&limit=100`)
      if (!response.ok) return

      const photos: PicsumPhoto[] = await response.json()
      this.photoCache = photos
    } catch {
      // 获取列表失败，使用空缓存
    }
  }

  /**
   * 获取备用图片（当 API 失败时使用）
   */
  private getFallbackPhoto(): WallpaperInfo {
    // 使用一些已知的高质量图片 ID
    const knownIds = [10, 20, 28, 29, 42, 47, 48, 58, 65, 84, 96, 100, 119, 122, 129]
    const randomId = knownIds[Math.floor(Math.random() * knownIds.length)]
    const timestamp = Date.now()

    return {
      id: `picsum-fallback-${randomId}-${timestamp}`,
      url: `${this.baseUrl}/id/${randomId}/1920/1080`,
      thumbUrl: `${this.baseUrl}/id/${randomId}/400/300`,
      author: 'Picsum Photos',
      authorUrl: 'https://picsum.photos',
      downloadUrl: `${this.baseUrl}/id/${randomId}/1920/1080`
    }
  }

  /**
   * 预定义的分类列表
   * 注：Picsum 不支持分类，仅保留"随机图片"选项
   */
  getCategories(): Array<{ value: string; label: string }> {
    return [{ value: 'random', label: '随机图片' }]
  }
}

// 保持导出名称兼容
export const unsplashService = new WallpaperService()
