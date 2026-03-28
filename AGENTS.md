# AGENTS.md

## 项目概述

Chrome / Chromium 内核浏览器新标签页扩展。提供网站快捷方式管理、分组文件夹、每日壁纸、搜索栏和个性化设置。**仅支持 Chrome 及 Chromium 内核浏览器**（Edge、Opera、Brave 等），不支持 Firefox / Safari。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 扩展框架 | WXT | ^0.20.20 |
| UI 框架 | Preact | ^10.29.0 |
| 状态管理 | @preact/signals | ^2.9.0 |
| 构建工具 | Vite（`package.json` 显式声明 + `overrides` 覆盖 WXT 内置） | ^8.x（当前 8.0.3） |
| CSS | Tailwind CSS | ^4.2.2 |
| Tailwind Vite 插件 | @tailwindcss/vite | ^4.2.2 |
| Preact Vite 预设 | @preact/preset-vite | ^2.10.5 |
| 语言 | TypeScript | ^6.0.2 |
| 格式化 | oxfmt | ^0.42.0 |
| 代码检查 | oxlint | ^1.57.0 |
| 测试 | Vitest | ^4.1.2 |
| 持久化 | IndexedDB (idb ^8.0.3) + localStorage | - |
| 扩展规范 | Chrome Extension Manifest V3（WXT 自动生成） | - |
| 包管理 | bun | ^1.3.x |

## 常用命令

```bash
bun run dev          # WXT 开发模式（启动新 Chrome 实例加载扩展，HMR）
bun run dev:vite     # 纯 Vite 开发服务器（无浏览器实例，UI 开发调试用）
bun run build        # WXT 生产构建 → .output/chrome-mv3/
bun run zip          # 打包扩展为 .zip（发布用）
bun run lint         # oxlint 检查
bun run format       # oxfmt 格式化
bun run test         # Vitest 运行测试
```

> `dev` 与 `dev:vite` 的区别：`dev` 通过 WXT 启动一个全新 Chrome 实例并加载扩展，适合测试扩展完整行为；`dev:vite` 仅启动 Vite 开发服务器，通过 `localhost` 访问 UI 页面，适合快速 UI 迭代。  
> WXT 0.20 的默认 CLI 命令即开发服务器，**`package.json` 的 `dev` 须为 `wxt`**；若写成 `wxt dev`，`dev` 会被当作项目根目录，从而在 `dev/entrypoints` 下找入口并失败。

## 目录结构

```text
src/
├── assets/              # 静态资源（SVG 图标）
├── components/          # 通用 UI 组件
├── entrypoints/         # WXT 入口点（自动检测）
│   └── newtab/          # 新标签页入口
│       ├── index.html
│       └── main.tsx
├── hooks/               # 自定义 Preact Hooks
├── services/            # 数据服务（IndexedDB、localStorage、壁纸 API）
├── stores/              # Preact Signals 状态管理
├── styles/
│   └── main.css         # Tailwind CSS v4 入口 + @theme 设计令牌
├── types/               # TypeScript 类型定义
└── utils/               # 工具函数
public/
└── icons/               # 扩展图标（16/48/128）
wxt.config.ts            # WXT 配置（集成 Vite + Manifest，browser: 'chrome'）
tsconfig.json
package.json
```

## 代码规范

- **命名**：组件 PascalCase，函数/变量 camelCase，常量 UPPER_SNAKE_CASE，文件名 kebab-case
- **文件扩展名**：组件 `.tsx`，非组件 `.ts`
- **导入顺序**：外部依赖 → 内部模块（`@/` 别名） → 样式 → 类型
- **状态管理**：全局/共享状态用 Preact Signals，组件局部状态用 `useState`/`useSignal`
- **样式**：优先 Tailwind 工具类；复杂动画可用 CSS Modules 或内联样式
- **类型**：所有公开 API 和复杂类型必须有 TypeScript 标注
- **无冗余注释**：不写 "// 导入模块" 之类的叙述性注释，只注释非显而易见的意图与约束

## 性能约束

- 新标签页首屏目标 < 200ms
- JS 产物体积 < 50KB gzip
- 壁纸渐进式加载（模糊占位 → 高清渐显）
- IndexedDB 存大数据（网站/分组/自定义图标 base64），localStorage 存轻量设置（同步读取，保证首屏速度）
- CSS Grid 原生网格布局，零 JS 布局计算
- 设置面板动态 import 按需加载

## UI/UX 设计

本项目使用 `ui-ux-pro-max` 技能生成设计系统，详见 `design-system/MASTER.md`。
遵循 `ui-ux-pro-max` Pre-Delivery Checklist 进行交付前审查。
