import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// 用于独立调试的 Vite 配置
export default defineConfig({
  plugins: [vue(), vueJsx()],
  root: 'entrypoints/newtab',
  resolve: { alias: { '@': resolve(__dirname), '~': resolve(__dirname) } },
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api/picsum': {
        target: 'https://picsum.photos',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/picsum/, '')
      },
      '/api/bing': {
        target: 'https://www.bing.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bing/, '')
      }
    }
  }
})
