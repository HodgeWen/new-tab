# 项目脚手架与基础设施

> 状态: 已执行

## 目标

基于 **WXT**（当前最流行的浏览器扩展框架）搭建完整的项目基础设施：WXT + Preact + Tailwind CSS v4 构建系统、Chrome 扩展 Manifest V3 自动生成、数据持久化服务层（IndexedDB + localStorage）、通过 `ui-ux-pro-max` 技能生成设计系统。完成后可在 Chrome 中加载扩展并看到基础新标签页布局。

**仅支持 Chrome 及 Chromium 内核浏览器**（Edge、Opera、Brave 等），不支持 Firefox / Safari。

### 技术栈（全部最新版本，2026-03-28 验证）

| 类别 | 技术 | 版本 |
|------|------|------|
| 扩展框架 | WXT | ^0.20.20 |
| UI 框架 | Preact | ^10.29.0 |
| 状态管理 | @preact/signals | ^2.9.0 |
| 构建工具 | Vite（直接声明，覆盖 WXT 内置） | ^8.x（最新） |
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

## 内容

### 1. 项目初始化（WXT + bun）

- 使用 `bunx wxt@latest init` 初始化 WXT 项目
- WXT 无官方 Preact 模板，选 Vanilla 后手动集成 Preact
- 安装核心依赖：`preact`、`@preact/signals`、`idb`
- 安装构建依赖：`wxt`、`vite`（显式声明最新版本覆盖 WXT 内置）、`@preact/preset-vite`、`typescript`、`tailwindcss`、`@tailwindcss/vite`
- 安装开发依赖：`oxlint`、`vitest`
- 配置 `tsconfig.json`：Preact JSX pragma、路径别名 `@/` → `src/`、严格模式
- 完成标准：`bun install` 零错误

### 2. WXT 配置（wxt.config.ts）

- 创建 `wxt.config.ts`，替代传统 `vite.config.ts` + `manifest.json`：
  - `srcDir: 'src'` 指定源码目录
  - `browser: 'chrome'` 明确目标为 Chrome / Chromium（不构建 Firefox 产物）
  - 通过 `vite()` 钩子集成 `@preact/preset-vite` 和 `@tailwindcss/vite` 插件
  - `manifest` 字段声明扩展元数据：`name`、`description`、`permissions: ["storage"]`、`icons`
  - `runner.startUrls` 配置开发时自动打开新标签页
- WXT 从文件系统入口点自动生成 Manifest V3，无需手动维护 `manifest.json`
- 完成标准：`bun run build` 成功，`.output/chrome-mv3/` 包含自动生成的 `manifest.json`

### 3. 开发脚本配置

添加以下 bun scripts：

| 脚本 | 命令 | 用途 |
|------|------|------|
| `dev` | `wxt` | WXT 开发模式（启动新浏览器实例加载扩展，HMR）；勿用 `wxt dev`，否则根目录被解析为 `dev/` |
| `dev:vite` | `vite` | 纯 Vite 开发服务器（无浏览器实例，UI 开发调试用） |
| `build` | `wxt build` | WXT 生产构建 → `.output/chrome-mv3/` |
| `zip` | `wxt zip` | 打包扩展为 `.zip`（发布用） |
| `lint` | `oxlint src` | 代码检查 |
| `format` | `oxfmt src` | 代码格式化 |
| `test` | `vitest` | 单元测试 |

`dev:vite` 与 `dev` 的区别：
- `dev`（WXT）：启动一个全新的 Chrome 实例并加载扩展，适合测试扩展完整行为
- `dev:vite`：仅启动 Vite 开发服务器，通过 `localhost` 访问 UI 页面，适合快速 UI 迭代，无需每次切换浏览器窗口

为此，`src/entrypoints/newtab/main.tsx` 需兼容两种运行环境（直接访问 localhost 和作为扩展新标签页）。

### 4. Tailwind CSS v4 配置

- 创建 `src/styles/main.css`，使用 `@import "tailwindcss"` 入口
- 在 `@theme` 块中写入由 `ui-ux-pro-max` 生成的设计令牌（色彩、字体、间距、圆角、阴影）
- 在入口组件中导入 `main.css`
- 完成标准：Tailwind 工具类在组件中生效

### 5. WXT 文件系统入口点

- 创建 `src/entrypoints/newtab/index.html`：最小 HTML 模板，包含 `<div id="root">` 和脚本引用
- 创建 `src/entrypoints/newtab/main.tsx`：Preact 渲染入口，挂载 `App` 组件到 `#root`
- WXT 自动识别 `newtab` 入口点并在 manifest 中配置 `chrome_url_overrides.newtab`
- 完成标准：Chrome 加载扩展后新标签页被接管；`dev:vite` 时可通过 localhost 访问

### 6. 代码质量工具链

- 配置 oxlint（启用推荐规则集）
- 配置 oxfmt（默认配置或项目级配置）
- 验证 `bun run lint` 和 `bun run format` 命令可执行
- 完成标准：lint / format 命令正常运行且零误报

### 7. 目录结构

- 按 WXT 约定 + 项目规划创建完整目录：
  ```
  src/
  ├── assets/             # 静态资源（SVG 图标）
  ├── components/         # 通用 UI 组件
  ├── entrypoints/        # WXT 入口点（自动检测）
  │   └── newtab/         # 新标签页入口
  │       ├── index.html
  │       └── main.tsx
  ├── hooks/              # 自定义 Preact Hooks
  ├── services/           # 数据服务（IndexedDB、localStorage、壁纸 API）
  ├── stores/             # Preact Signals 状态管理
  ├── styles/
  │   └── main.css        # Tailwind CSS v4 入口 + @theme 设计令牌
  ├── types/              # TypeScript 类型定义
  └── utils/              # 工具函数
  public/
  └── icons/              # 扩展图标（16/48/128）
  wxt.config.ts           # WXT 配置（集成 Vite + Manifest）
  tsconfig.json
  package.json
  ```
- 完成标准：目录结构完整

### 8. 数据持久化服务层

- 使用 `idb` 库封装 IndexedDB 服务
  - 数据库初始化（`new-tab-db`）与版本迁移机制
  - 网站表（`websites`）：id、name、url、icon（base64 | URL）、order、groupId
  - 分组表（`groups`）：id、name、size、order、children
  - 通用 CRUD 方法：`getAll`、`get`、`put`、`delete`
- 封装 localStorage 服务
  - 类型安全的 `get<T>` / `set<T>` 方法
  - 设置数据 schema 定义
- 完成标准：服务可独立调用并通过单元测试

### 9. 使用 ui-ux-pro-max 生成设计系统

- 运行 `ui-ux-pro-max` 技能生成设计系统
- 将生成的设计令牌写入 `src/styles/main.css` 的 `@theme` 块
- 完成标准：`design-system/MASTER.md` 存在且设计令牌在 Tailwind 中可用

### 10. 基础布局组件

- 创建 `App` 根组件：全屏容器（壁纸背景层 + 内容层）
- 创建 `Grid` 容器组件：CSS Grid 网格，响应式列数
- 创建入口 `main.tsx`：渲染 `App` 到 `#root`
- 完成标准：新标签页显示空白网格布局，背景可见

### 11. AGENTS.md 同步更新

- 更新 `AGENTS.md` 技术栈表格为本计划确认的最新版本
- 更新常用命令为 bun 命令（含 dev / dev:vite 两种开发模式）
- 更新目录结构为 WXT 目录约定（含 `entrypoints/`）
- 更新浏览器支持说明为 Chrome / Chromium only
- 完成标准：`AGENTS.md` 与实际项目配置一致

### 12. 端到端验证

- `bun run build` 成功，产物在 `.output/chrome-mv3/`
- Chrome 加载扩展，新标签页显示基础布局
- `bun run dev`（`wxt`）打开新 Chrome 实例，HMR 正常
- `bun run dev:vite` 在 localhost 渲染 UI 正常
- `bun run lint` 零错误
- 数据服务单元测试通过

## 影响范围

- `package.json`、`bun.lock`
- `wxt.config.ts`、`vite.config.ts`、`tsconfig.json`、`vitest.config.ts`、`vitest.setup.ts`、`oxlintrc.json`
- `.gitignore`
- `AGENTS.md`
- `design-system/MASTER.md`
- `public/icons/icon16.png`、`public/icons/icon48.png`、`public/icons/icon128.png`
- `src/assets/.gitkeep`、`src/hooks/.gitkeep`、`src/stores/.gitkeep`、`src/utils/.gitkeep`
- `src/components/app.tsx`、`src/components/grid.tsx`
- `src/entrypoints/newtab/index.html`、`src/entrypoints/newtab/main.tsx`
- `src/services/db.ts`、`src/services/db.test.ts`、`src/services/local-storage.ts`、`src/services/local-storage.test.ts`
- `src/styles/main.css`
- `src/types/db-schema.ts`、`src/types/persistence.ts`

## 历史补丁

- patch-1: 修复 WXT dev 脚本与网格可见示例
- patch-2: 优化布局居中与响应式美化

