# 项目代理指导 (Agent Guidelines)

本文档旨在为 AI 代理提供关于本项目的设计规范、代码风格及最佳实践的指导。

## 1. 主题系统 (Theme System)

本项目使用基于 **CSS 变量** 的统一主题系统，核心设计语言为 **毛玻璃风格 (Glassmorphism)**。

### 1.1 文件结构

```
entrypoints/newtab/
├── style.css              # 主入口（已在 main.ts 中引用）
└── styles/
    ├── variables.css      # CSS 变量（设计令牌）
    ├── reset.css          # 基础样式重置
    └── utilities.css      # 工具类（.glass 等）
```

### 1.2 可用的 CSS 变量

在编写组件样式时，**必须使用以下 CSS 变量**，禁止硬编码颜色、间距等值：

```css
/* 玻璃效果（增强版，支持多层阴影） */
--glass-bg              /* 玻璃背景色 */
--glass-bg-hover        /* 悬停时背景色 */
--glass-bg-active       /* 激活时背景色 */
--glass-border          /* 玻璃边框色 */
--glass-border-strong   /* 强调边框色 */
--glass-blur            /* 模糊程度 (20px) */
--glass-blur-strong     /* 强模糊 (32px) */
--glass-shadow          /* 标准阴影 */
--glass-shadow-subtle   /* 微妙阴影 */
--glass-shadow-elevated /* 提升阴影 */

/* 文字颜色 */
--text-primary    /* 主要文字 */
--text-secondary  /* 次要文字 */
--text-muted      /* 弱化文字 */
--text-caption    /* 说明/辅助文字 (12px) */
--text-body       /* 正文 (14px) */
--text-title      /* 标题 (18px) */

/* 功能色（精致色调） */
--color-primary         /* 主色调 (Indigo #6366f1) */
--color-primary-hover
--color-primary-subtle  /* 半透明背景版本 */
--color-danger          /* 危险 (Rose #f43f5e) */
--color-danger-subtle
--color-success         /* 成功 (Emerald #10b981) */
--color-success-subtle
--color-warning         /* 警告 (Amber #f59e0b) */
--color-warning-subtle

/* 渐变 */
--gradient-glass    /* 玻璃渐变覆盖层 */
--gradient-primary  /* 主色渐变 */
--gradient-shimmer  /* 闪烁效果 */

/* 间距 */
--spacing-xs (4px) | --spacing-sm (8px) | --spacing-md (16px) | --spacing-lg (24px) | --spacing-xl (32px)

/* 圆角 */
--radius-sm (8px) | --radius-md (12px) | --radius-lg (16px) | --radius-full

/* 缓动函数 */
--ease-out     /* 快进慢出，响应迅速 */
--ease-in-out  /* 对称缓动 */
--ease-spring  /* 弹性效果 */

/* 过渡动画（使用精致缓动） */
--transition-fast (120ms) | --transition-normal (200ms) | --transition-slow (350ms) | --transition-spring (400ms)

/* 字重 */
--font-regular (400) | --font-medium (500)
```

### 1.2.1 壁纸主题适配

项目支持多种壁纸主题，通过 `data-theme` 属性切换：

- **默认（无属性）**：适配各种壁纸的通用方案
- `data-theme="dark-wallpaper"`：深色壁纸优化（深色玻璃背景）
- `data-theme="light-wallpaper"`：浅色壁纸优化（白色玻璃背景、深色文字）

### 1.3 核心视觉特征

所有 UI 组件应遵循以下视觉原则：

- **背景模糊**: 使用 `backdrop-filter: blur(var(--glass-blur))` 创造层次感
- **半透明渐变**: 使用 `var(--glass-bg)` + `var(--gradient-glass)` 增加质感
- **微妙边框**: 使用 `border: 1px solid var(--glass-border)`
- **层级阴影**: 根据层级选择 `--glass-shadow-subtle`、`--glass-shadow` 或 `--glass-shadow-elevated`
- **圆角**: 使用 `var(--radius-*)` 变量
- **统一尺寸**: 组件默认高度统一为 40px，不再支持 size 变体。

### 1.4 交互细节

- **Hover**: 背景从 `--glass-bg` 变为 `--glass-bg-hover`，可配合 `translateY(-2px)` 提升效果
- **Active**: 轻微缩小 `transform: scale(0.97)` 配合 `--glass-bg-active`
- **过渡**: 使用 `--transition-fast` 或 `--transition-normal`，自动应用精致缓动

## 2. 组件开发指导 (Component Guidelines)

### 2.1 样式编写规范

组件样式**必须在各自的 `.vue` 文件中使用 `<style scoped>` 定义**，引用全局 CSS 变量。

#### Button 组件特别说明
- 当 Button 仅包含图标（或无文字内容）时，应呈现为正方形（宽高相等）。
- 默认高度固定为 40px。

```vue
<template>
  <button class="my-button" :class="{ 'is-square': isSquare }">
    <slot />
  </button>
</template>

<style scoped>
.my-button {
  height: 40px;
  /* ... glass styles ... */
}
.is-square {
  width: 40px;
  padding: 0;
}
</style>
```

### 2.2 组件开发原则

1. **优先复用**：优先复用现有的基础组件（Button, Input, Modal 等）
2. **使用变量**：所有样式值必须使用 CSS 变量，便于主题统一
3. **Scoped 样式**：使用 `<style scoped>` 避免样式污染
4. **毛玻璃风格**：新组件默认应具备 Glassmorphism 特征
5. **Vue 最佳实践**：
   - 使用 `<script setup lang="ts">`
   - 使用 `lucide-vue-next` 图标库
   - 使用 Props 解构 (Vue 3.5+)
   - 使用 `defineModel` 处理双向绑定
   - 使用 `useTemplateRef` 替代传统的 DOM refs

### 2.3 工具类（可选）

`utilities.css` 提供了一些快捷工具类，可在模板中直接使用：

**玻璃效果**
- `.glass` - 标准毛玻璃面板
- `.glass-elevated` - 强化毛玻璃（用于模态框等重要容器）
- `.glass-subtle` - 微妙玻璃（用于列表项，悬停时显现）

**布局**
- `.flex-center` - Flex 居中
- `.flex-col` - Flex 纵向
- `.flex-between` - 两端对齐
- `.flex-gap` - Flex 间距 (8px)

**文本**
- `.truncate` - 文本截断
- `.text-secondary` / `.text-muted` - 次要/弱化文字颜色
- `.font-medium` - 中等字重

**交互**
- `.pressable` - 按下缩小效果
- `.hoverable` - 悬停提升效果

**滚动**
- `.no-scrollbar` - 隐藏滚动条
- `.custom-scrollbar` - 自定义精致滚动条

**动画**
- `.animate-fade-in` - 淡入
- `.animate-slide-up` - 从下方滑入
- `.animate-scale-in` - 缩放弹入
