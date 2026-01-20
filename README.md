# New Tab - 浏览器新标签页扩展

一个美观、实用的浏览器新标签页扩展，提供优雅的收藏网站管理体验。

## ✨ 功能特性

- 🔖 **收藏管理** - 快速添加、编辑、删除收藏网站
- 📁 **文件夹分组** - 类 iOS 风格的文件夹管理，支持多种尺寸
- 🔀 **拖拽排序** - 流畅的拖拽体验，自由排列图标位置
- 🔍 **搜索栏** - 支持 Bing/Google 快速搜索
- 🖼️ **动态壁纸** - Picsum 高质量背景图自动轮播
- 💾 **数据同步** - 本地存储 + WebDAV 云备份
- 🎨 **毛玻璃 UI** - 现代化的玻璃拟态视觉效果

## 🚀 快速开始

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
bun run dev
```

启动后，在浏览器扩展管理页面加载 `.output/chrome-mv3` 目录。

### 构建生产版本

```bash
bun run build
```

### 打包扩展

```bash
bun run zip
```

## 🛠️ 技术栈

| 分类     | 技术             |
| -------- | ---------------- |
| 包管理器 | Bun 1.3          |
| 扩展框架 | WXT              |
| 前端框架 | Vue 3            |
| 构建工具 | Vite             |
| CSS 引擎 | UnoCSS           |
| 状态管理 | Pinia            |
| 网格布局 | GridStack        |
| 图标库   | Iconify (Lucide) |

## 📦 项目结构

```
new-tab/
├── entrypoints/          # WXT 入口文件
│   └── newtab/           # 新标签页
├── components/           # Vue 组件
│   ├── ui/               # 基础 UI 组件
│   └── ...               # 业务组件
├── stores/               # Pinia 状态管理
├── services/             # 服务层
├── composables/          # Vue 组合函数
├── utils/                # 工具函数
├── types/                # TypeScript 类型定义
├── assets/               # 静态资源
├── wxt.config.ts         # WXT 配置
├── uno.config.ts         # UnoCSS 配置
└── tsconfig.json         # TypeScript 配置
```

## 🎯 浏览器支持

仅支持 Chromium 内核浏览器：

- Google Chrome
- Microsoft Edge
- Arc Browser
- Brave Browser
- 等其他基于 Chromium 的浏览器

## 🤝 贡献指南

### 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范。提交信息格式：

```
<type>(<scope>): <subject>

[body]

[footer]
```

**允许的 type：**

| Type       | 说明                   |
| ---------- | ---------------------- |
| `feat`     | 新功能                 |
| `fix`      | 修复 Bug               |
| `docs`     | 文档更新               |
| `style`    | 代码格式（不影响功能） |
| `refactor` | 重构                   |
| `perf`     | 性能优化               |
| `test`     | 测试相关               |
| `build`    | 构建系统               |
| `ci`       | CI/CD 配置             |
| `chore`    | 其他杂项               |

**示例：**

```bash
git commit -m "feat(bookmark): 添加批量删除功能"
git commit -m "fix: 修复书签加载失败的问题"
git commit -m "docs: 更新 README 安装说明"
```

### 发布流程

1. 确保所有更改已提交
2. 运行发布命令：
   ```bash
   bun run release
   ```
3. Release-it 会自动：
   - 根据提交类型计算新版本号
   - 更新 `CHANGELOG.md`
   - 同步 `wxt.config.ts` 版本
   - 创建 Git 标签并推送
4. GitHub Actions 将自动构建并创建 Release

**预览发布：**

```bash
bun run release:dry
```

## 📝 License

MIT
