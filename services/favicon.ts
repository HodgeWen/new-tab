/**
 * Favicon 获取服务
 * 策略：Google Favicon Service -> 默认图标
 */

class FaviconService {
  private readonly googleFaviconUrl = 'https://www.google.com/s2/favicons'
  private readonly defaultIcon =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23667eea" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">?</text></svg>'

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
