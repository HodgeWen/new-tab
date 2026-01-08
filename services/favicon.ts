/**
 * Favicon 获取服务
 * 策略：Google Favicon Service -> 直接访问 -> 默认图标
 */
class FaviconService {
  private readonly googleFaviconUrl = 'https://www.google.com/s2/favicons'
  private readonly defaultIcon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23667eea" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">?</text></svg>'

  /**
   * 获取网站 favicon URL
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
   * 尝试获取高质量 favicon，失败则回退
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
   * 生成基于标题的默认图标
   */
  generateDefaultIcon(title: string): string {
    const letter = (title[0] || '?').toUpperCase()
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#fa709a',
    ]
    const color = colors[title.charCodeAt(0) % colors.length]

    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="${color}" width="100" height="100" rx="20"/><text x="50" y="68" font-size="50" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="600">${letter}</text></svg>`)}`
  }
}

export const faviconService = new FaviconService()

