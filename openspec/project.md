# Project Context

## Purpose

浏览器新标签页扩展（WXT + Manifest V3），覆盖 `chrome_url_overrides.newtab`。

**核心目标**：提供美观实用的新标签页体验，包括：

- 收藏站点管理（添加/编辑/删除）
- 文件夹分组（支持多种尺寸）
- 网格布局与拖拽排布（GridStack）
- 搜索集成（优先使用 browser.search API）
- 动态壁纸（Bing/Picsum）
- 数据备份（本地 JSON + WebDAV 云备份）

## Tech Stack

### 构建与运行

- **包管理**: Bun
- **扩展框架**: WXT (v0.20+)
- **构建工具**: Vite
- **语言**: TypeScript（严格模式）

### 前端

- **框架**: Vue 3 + `<script setup>`
- **状态管理**: Pinia
- **布局拖拽**: GridStack
- **样式**: UnoCSS + TailwindCSS v4

### 数据与网络

- **本地存储**: IndexedDB (Dexie)
- **云备份**: WebDAV SDK

### 样式与图标

- **CSS 框架**: UnoCSS（预设 Uno / Icons / WebFonts）
- **图标集**: Iconify (lucide)
- **辅助库**: clsx, tailwind-merge, class-variance-authority

## Project Conventions

### Code Style

**文件命名**

- 遵循 **kebab-case** 命名法（如 `user-manage.ts`、`grid-items.ts`）

**TypeScript 规范**

- 严格类型定义，禁止使用 `any` 类型
- 对象结构优先使用 `interface`（可扩展）
- 联合类型、工具类型使用 `type`
- 不得存在类型错误

**导出偏好**

- 使用具名导出，避免默认导出（支持 tree-shaking）

**函数参数**

- 超过 3 个参数时使用对象参数

**注释要求**

- 公共 API 必须有 JSDoc 注释
- 注释应解释"为什么"而非"做什么"

**其他**

- 遵循 SOLID 原则，函数职责单一
- 禁止死代码（未使用或不可达代码）

### Architecture Patterns

**四层架构**

```
UI 层（Vue 组件）
    ↓
状态层（Pinia stores）
    ↓
服务层（services）
    ↓
工具与类型（utils/types）
```

**目录结构**

- `entrypoints/`: 扩展入口（newtab）
- `components/`: Vue 组件
- `stores/`: Pinia 状态管理
- `services/`: 业务服务（数据库、网络、外部资源）
- `types/`: TypeScript 类型定义
- `utils/`: 通用工具函数

**关键 Stores**

- `grid-items.ts`: 书签/文件夹 CRUD、网格布局、批量操作
- `settings.ts`: 设置读写与默认值合并
- `wallpaper.ts`: 壁纸加载、缓存、预加载
- `ui.ts`: 上下文菜单、模态框、编辑模式

**关键 Services**

- `database.ts`: Dexie 封装，统一 IndexedDB 存取
- `webdav.ts`: WebDAV 备份/恢复 + 加密配置
- `wallpaper-service.ts`: 壁纸源统一接口与 fallback
- `favicon.ts`: favicon 获取与缓存

### Testing Strategy

暂未建立正式测试框架。重构时应考虑添加：

- 单元测试（Vitest）
- 组件测试（Vue Test Utils）

### Git Workflow

**提交规范**

- 使用 Conventional Commits（通过 commitlint 强制）
- 提交类型：`feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `build` | `ci` | `chore` | `revert`
- 主题最大长度：100 字符
- 主题和类型不能为空

**工具链**

- Husky: Git hooks
- lint-staged: 提交前检查
- release-it: 版本发布管理

**分支策略**

- `main`: 主分支，保持稳定
- 功能开发使用 feature 分支

## Domain Context

**浏览器扩展开发**

- 遵循 Manifest V3 规范
- WXT 框架抽象了 Chrome/Firefox 差异
- 需要声明的权限：`search`、`host_permissions`

**数据模型**

- `GridItem`: 基础类型（site/folder 公共字段）
- `SiteItem`: URL + favicon
- `FolderItem`: size + children
- `Settings`: 搜索栏/WebDAV/壁纸配置
- `WallpaperInfo`: 壁纸元信息

**存储结构（IndexedDB）**

- 表：`bookmarks` / `settings` / `wallpapers` / `webdav` / `favicons`
- favicon 使用 Base64 缓存
- 壁纸使用 Blob 缓存（current/next）

**设计语言**

- 深色系 + 渐变背景 + 半透明磨砂（Glassmorphism）
- 大圆角（`rounded-xl` / `rounded-2xl`）
- 轻量描边风格图标（lucide）
- 轻微缩放与淡入淡出动效

## Important Constraints

**扩展合规**

- 搜索使用 `browser.search` API 优先，符合扩展商店政策
- 不支持时回退到 Google 搜索页

**数据兼容**

- 必须保留旧版数据迁移逻辑（FolderSize → GridSize、rootOrder → gridPosition）
- 重构需提供迁移脚本或保持向后兼容

**可用性**

- 壁纸失败或未启用时仍需保证可读的默认渐变背景

**性能与内存**

- 壁纸 Blob URL 需要及时释放，避免内存泄漏
- favicon 缓存策略：Google S2 → favicon.ico → 默认 SVG

**安全**

- WebDAV 密码加密存储（AES-GCM + PBKDF2，弱保护）

## External Dependencies

**壁纸服务**

- Bing 壁纸：`https://peapix.com/bing/feed`
- Picsum：`https://picsum.photos/*`、`https://fastly.picsum.photos/*`

**Favicon 服务**

- Google S2：`https://www.google.com/s2/favicons`

**云备份**

- WebDAV 协议（用户自行配置服务器）
