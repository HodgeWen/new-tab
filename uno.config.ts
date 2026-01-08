import {
  defineConfig,
  presetUno,
  presetIcons,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
    presetWebFonts({
      provider: 'none',
      fonts: {
        // 使用系统字体堆栈，避免网络超时问题
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      glass: {
        bg: 'rgba(255, 255, 255, 0.15)',
        border: 'rgba(255, 255, 255, 0.2)',
        text: 'rgba(255, 255, 255, 0.9)',
      },
    },
  },
  shortcuts: {
    'glass': 'bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg',
    'glass-hover': 'hover:bg-white/25 hover:border-white/30 transition-all duration-200',
    'glass-dark': 'bg-black/20 backdrop-blur-xl border border-white/10',
    'btn-icon': 'p-2 rounded-lg glass glass-hover cursor-pointer',
    'text-shadow': 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
  },
})

