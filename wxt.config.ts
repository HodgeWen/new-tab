import { defineConfig } from 'wxt'
import UnoCSS from 'unocss/vite'

// 修复 MaxListenersExceededWarning 警告
// WXT/Vite 开发服务器内部会添加多个事件监听器
process.setMaxListeners(20)

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'New Tab',
    description: '美观实用的浏览器新标签页扩展',
    version: '1.0.0',
    permissions: ['storage'],
    host_permissions: [
      'https://picsum.photos/*',
      'https://fastly.picsum.photos/*'
    ],
    chrome_url_overrides: {
      newtab: 'newtab.html'
    }
  },
  vite: () => ({
    plugins: [UnoCSS()],
    resolve: {
      alias: {
        '@': __dirname,
        '~': __dirname
      }
    }
  })
})
