/**
 * Favicon 获取与缓存服务
 * 策略：缓存 -> Google Favicon Service -> 直接访问 -> 默认图标
 */
import { db } from './database'

class FaviconService {
  private readonly googleFaviconUrl = 'https://www.google.com/s2/favicons'
  private readonly defaultIcon =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23667eea" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">?</text></svg>'

  /**
   * 从 URL 中提取域名
   */
  private getDomain(url: string): string | null {
    try {
      return new URL(url).hostname
    } catch {
      return null
    }
  }

  /**
   * 获取 favicon URL（同步方法，仅用于快速获取 Google 服务 URL）
   */
  getFaviconUrl(url: string, size: number = 64): string {
    try {
      const domain = new URL(url).hostname
      return `${this.googleFaviconUrl}?domain=${domain}&sz=${size}`
    } catch {
      return this.defaultIcon
    }
  }

  /**
   * 获取 favicon，优先从缓存读取
   * @param url 网站 URL
   * @returns favicon 的 Base64 数据或 URL
   */
  async getFaviconWithCache(url: string): Promise<string> {
    const domain = this.getDomain(url)
    if (!domain) return this.defaultIcon

    // 尝试从缓存读取
    const cached = await db.getFavicon(domain)
    if (cached) {
      return cached
    }

    // 缓存未命中，返回 Google 服务 URL
    return this.getFaviconUrl(url)
  }

  /**
   * 获取并缓存 favicon
   * @param url 网站 URL
   * @returns favicon 的 Base64 数据
   */
  async fetchAndCacheFavicon(url: string): Promise<string> {
    const domain = this.getDomain(url)
    if (!domain) return this.defaultIcon

    // 先检查缓存
    const cached = await db.getFavicon(domain)
    if (cached) {
      return cached
    }

    try {
      // 尝试 Google Favicon Service
      const googleUrl = `${this.googleFaviconUrl}?domain=${domain}&sz=64`
      const base64 = await this.urlToBase64(googleUrl)
      if (base64) {
        await db.saveFavicon(domain, base64)
        return base64
      }

      // 尝试直接访问 favicon.ico
      const origin = new URL(url).origin
      const directUrl = `${origin}/favicon.ico`
      const directBase64 = await this.urlToBase64(directUrl)
      if (directBase64) {
        await db.saveFavicon(domain, directBase64)
        return directBase64
      }

      // 生成并缓存默认图标
      const defaultIcon = this.generateDefaultIcon(domain)
      await db.saveFavicon(domain, defaultIcon)
      return defaultIcon
    } catch {
      return this.generateDefaultIcon(domain)
    }
  }

  /**
   * 尝试获取高质量 favicon，失败则回退（不使用缓存）
   * @deprecated 使用 fetchAndCacheFavicon 替代
   */
  async fetchFavicon(url: string): Promise<string> {
    try {
      const domain = new URL(url).hostname

      // 尝试 Google Favicon Service
      const googleUrl = `${this.googleFaviconUrl}?domain=${domain}&sz=64`
      const isGoogleAvailable = await this.checkImageUrl(googleUrl)
      if (isGoogleAvailable) {
        return googleUrl
      }

      // 尝试直接访问 favicon.ico
      const origin = new URL(url).origin
      const directUrl = `${origin}/favicon.ico`
      const isDirectAvailable = await this.checkImageUrl(directUrl)
      if (isDirectAvailable) {
        return directUrl
      }

      // 返回默认图标
      return this.defaultIcon
    } catch {
      return this.defaultIcon
    }
  }

  /**
   * 检查图片 URL 是否可用
   */
  private async checkImageUrl(url: string): Promise<boolean> {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
      // 超时处理
      setTimeout(() => resolve(false), 3000)
    })
  }

  /**
   * 将图片 URL 转换为 Base64 数据
   */
  private async urlToBase64(url: string): Promise<string | null> {
    return new Promise(resolve => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width || 64
          canvas.height = img.height || 64
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
          } else {
            resolve(null)
          }
        } catch {
          resolve(null)
        }
      }

      img.onerror = () => resolve(null)
      img.src = url

      // 超时处理
      setTimeout(() => resolve(null), 5000)
    })
  }

  /**
   * 生成基于标题的默认图标
   */
  generateDefaultIcon(title: string): string {
    const letter = (title[0] || '?').toUpperCase()
    const colors = [
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#f5576c',
      '#4facfe',
      '#00f2fe',
      '#43e97b',
      '#fa709a'
    ]
    const color = colors[title.charCodeAt(0) % colors.length]

    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="${color}" width="100" height="100" rx="20"/><text x="50" y="68" font-size="50" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="600">${letter}</text></svg>`)}`
  }

  /**
   * 清除所有 favicon 缓存
   */
  async clearCache(): Promise<void> {
    await db.clearFaviconCache()
  }

  /**
   * 获取缓存数量
   */
  async getCacheCount(): Promise<number> {
    return await db.getFaviconCacheCount()
  }
}

export const faviconService = new FaviconService()
