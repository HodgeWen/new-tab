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
   * @returns favicon 的 URL
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
      // 直接缓存 Google Favicon Service 的 URL，避免跨域转码
      const googleUrl = `${this.googleFaviconUrl}?domain=${domain}&sz=64`
      await db.saveFavicon(domain, googleUrl)
      return googleUrl
    } catch {
      return this.getFaviconUrl(url)
    }
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

    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="${color}" width="100" height="100" rx="20"/><text x="50" y="68" font-size="50" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="600">${letter}</text></svg>`
    )}`
  }
}

export const faviconService = new FaviconService()
