import type { WallpaperInfo } from '@/types'
import {
  type WallpaperProvider,
  type WallpaperCategory,
  BingWallpaperProvider,
  PicsumWallpaperProvider
} from './wallpaper-provider'

/**
 * 壁纸服务 - 统一管理多个壁纸提供者
 *
 * 提供者优先级:
 * 1. Bing - 主要壁纸源，高质量图片
 * 2. Picsum - 备用壁纸源，可靠性高
 */
class WallpaperService {
  private providers: Map<string, WallpaperProvider> = new Map()
  private fallbackProvider: WallpaperProvider

  constructor() {
    // 注册壁纸提供者
    const bingProvider = new BingWallpaperProvider()
    const picsumProvider = new PicsumWallpaperProvider()

    this.providers.set(bingProvider.id, bingProvider)
    this.providers.set(picsumProvider.id, picsumProvider)

    // Picsum 作为 fallback
    this.fallbackProvider = picsumProvider
  }

  /**
   * 获取所有可用的壁纸提供者
   */
  getAvailableProviders(): WallpaperProvider[] {
    return Array.from(this.providers.values())
  }

  /**
   * 获取指定的壁纸提供者
   */
  getProvider(id: string): WallpaperProvider | undefined {
    return this.providers.get(id)
  }

  /**
   * 获取所有壁纸提供者
   */
  getProviders() {
    return Array.from(this.providers.values())
  }

  /**
   * 获取指定提供者支持的分类
   */
  getCategories(providerId: string): WallpaperCategory[] {
    const provider = this.providers.get(providerId)
    if (!provider || !provider.supportsCategory) {
      return []
    }
    return provider.getCategories()
  }

  /**
   * 检查提供者是否支持分类
   */
  supportsCategory(providerId: string): boolean {
    const provider = this.providers.get(providerId)
    return provider?.supportsCategory ?? false
  }

  /**
   * 获取随机壁纸
   * @param providerId 提供者ID（默认使用 bing）
   * @param category 分类（可选）
   */
  async getRandomPhoto(
    providerId: string = 'bing',
    category?: string
  ): Promise<WallpaperInfo | null> {
    const provider = this.providers.get(providerId)

    if (!provider) {
      console.warn(
        `[WallpaperService] Provider "${providerId}" not found, using fallback`
      )
      return this.fallbackProvider.getRandomPhoto()
    }

    try {
      const photo = await provider.getRandomPhoto(category)
      if (photo) {
        return photo
      }
      // 如果提供者返回 null，使用 fallback
      console.warn(
        `[WallpaperService] Provider "${providerId}" returned null, using fallback`
      )
      return this.fallbackProvider.getRandomPhoto()
    } catch (error) {
      console.error(
        `[WallpaperService] Provider "${providerId}" failed:`,
        error
      )
      return this.fallbackProvider.getRandomPhoto()
    }
  }
}

// 导出单例
export const wallpaperService = new WallpaperService()
