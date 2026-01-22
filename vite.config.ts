import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import vueJsx from '@vitejs/plugin-vue-jsx'

// 用于独立调试的 Vite 配置
export default defineConfig({
  plugins: [vue(), tailwindcss(), vueJsx()],
  root: 'entrypoints/newtab',
  resolve: {
    alias: {
      '@': resolve(__dirname),
      '~': resolve(__dirname)
    }
  },
  server: {
    port: 5173,
    open: false
  }
})
