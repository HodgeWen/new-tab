# 项目代理指导 (Agent Guidelines)

本文档旨在为 AI 代理提供关于本项目的设计规范、代码风格及最佳实践的指导。

**重要提示：**
在编写或修改 Vue 组件时，请务必参考 `vue-development-guides` 和 `vue-best-practices` 技能，以确保代码质量和风格一致性。

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
- **紧凑间距**: 默认容器内边距建议使用 `var(--spacing-md)` (16px)，避免过度留白。

### 1.4 交互细节

- **Hover**: 背景从 `--glass-bg` 变为 `--glass-bg-hover`，可配合 `translateY(-2px)` 提升效果
- **Active**: 轻微缩小 `transform: scale(0.97)` 配合 `--glass-bg-active`
- **过渡**: 使用 `--transition-fast` 或 `--transition-normal`，自动应用精致缓动

## 2. 组件开发指导 (Component Guidelines)

### 2.1 样式编写规范

组件样式**必须在各自的 `.vue` 文件中使用 `<style scoped>` 定义**，引用全局 CSS 变量。

### 2.2 组件开发原则

1. **优先复用**：优先复用现有的基础组件（Button, Input, Modal 等）。
2. **主题一致**：所有样式值必须使用 CSS 变量，确保支持主题切换。
3. **视觉风格**：新组件应默认具备 Glassmorphism（毛玻璃）特征。
4. **图标库**：统一使用 `lucide-vue-next` 图标库。
5. **Vue 版本特性**：项目使用 Vue 3.5+，请充分利用 Props 解构、`useTemplateRef` 等新特性。

*注：关于更详细的 Vue 编码规范及最佳实践，请直接参考 `vue-best-practices` 技能。*

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

## 3. 技术栈说明 (Technology Stack)

本项目基于以下核心依赖构建，请在对应场景下正确使用：

- **Core Framework**: `Vue 3.5+` (配合 TypeScript)
  - 核心 UI 框架，支持 Composition API 和最新 Vue 特性。
- **Extension Framework**: `WXT`
  - 处理浏览器扩展生命周期、Manifest 配置及构建流程。
- **UI & Layout**:
  - `gridstack`: 用于实现可拖拽、可调整大小的网格布局（主要用于新标签页 Widget 系统）。
  - `lucide-vue-next`: 项目统一的图标组件库。
- **Data & Storage**:
  - `dexie`: IndexedDB 的包装库，用于高性能的本地数据存储。
  - `webdav`: 用于处理 WebDAV 协议，实现数据的云端同步功能。
- **Utilities**:
  - `nanoid`: 生成唯一 ID。
