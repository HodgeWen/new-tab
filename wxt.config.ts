import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  imports: false,
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'New Tab',
    description: '美观实用的浏览器新标签页扩展',
    version: '1.1.0',
    icons: {
      16: '/icons/icon-16.png',
      32: '/icons/icon-32.png',
      48: '/icons/icon-48.png',
      128: '/icons/icon-128.png'
    },
    permissions: ['search', 'favicon'],
    host_permissions: [
      'https://www.bing.com/*',
      'https://picsum.photos/*',
      'https://fastly.picsum.photos/*'
    ],
    chrome_url_overrides: { newtab: '/newtab.html' }
  },
  vite: () => {
    return { plugins: [vueJsx()] }
  }
})
