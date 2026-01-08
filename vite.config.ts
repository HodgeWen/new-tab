import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'node:path'

// 用于独立调试的 Vite 配置
export default defineConfig({
  plugins: [vue(), UnoCSS()],
  root: 'entrypoints/newtab',
  resolve: {
    alias: {
      '@': resolve(__dirname),
      '~': resolve(__dirname)
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
