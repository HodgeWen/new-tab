# New Tab 项目基线说明

本文件用于梳理当前项目的功能、架构、技术栈与样式风格，作为后续重构的基础事实清单。

## 1. 项目定位

- 浏览器新标签页扩展（WXT + MV3），覆盖 `chrome_url_overrides.newtab`。
- 目标：提供“收藏站点管理 + 文件夹分组 + 拖拽排布 + 搜索 + 动态壁纸 + 备份”的新标签页体验。

## 2. 现有功能清单（按模块）

### 2.1 收藏与文件夹

- 添加/编辑/删除网站收藏（含标题、URL、favicon）。
- 新建/编辑/删除文件夹；支持三种尺寸（1×2、2×2、2×1）。
- 文件夹内展示最多 3 或 9 个站点预览图标，超出显示 “+N”。
- 文件夹详情弹窗支持拖拽排序（HTML5 Drag & Drop）。

### 2.2 网格布局与拖拽

- 根级书签使用 GridStack 实现网格布局、拖拽排序与位置持久化。
- 兼容旧数据：
  - FolderSize 从字符串迁移到 GridSize 对象。
  - 根级无 gridPosition 时根据 rootOrder 迁移为网格布局。

### 2.3 交互与编辑模式

- 右键菜单支持：新增网站/文件夹、编辑、删除、移动到分组、移出分组、调整文件夹尺寸。
- 编辑模式：
  - 多选网站（文件夹不可选）
  - 批量删除
  - 批量移动到指定文件夹/新建分组

### 2.4 搜索

- 搜索框支持快捷键 `/`、`Ctrl/Cmd + K` 聚焦。
- 优先使用 `browser.search`（符合扩展商店政策），不支持时回退到 Google 搜索页。

### 2.5 壁纸

- 壁纸来源可选：Bing（Peapix Feed）或 Picsum。
- 支持轮播间隔设置与手动切换。
- 壁纸缓存：当前/下一张 Blob 缓存（IndexedDB）。
- 壁纸加载失败时回退到默认渐变背景。

### 2.6 备份与数据迁移

- 本地导入/导出 JSON。
- WebDAV 云备份：测试连接、备份列表、备份/恢复/删除。
- WebDAV 密码加密存储（AES-GCM + PBKDF2，弱保护，非强加密）。

## 3. 架构与模块划分

### 3.1 入口与页面结构

- `entrypoints/newtab/index.html`：新标签页入口。
- `entrypoints/newtab/main.ts`：初始化 Vue 应用与 Pinia。
- `entrypoints/newtab/App.vue`：全局布局、背景层、顶栏按钮、主区域与全局弹层。

### 3.2 前端架构（层次）

- UI 层（Vue 组件）：展示与交互。
- 状态层（Pinia stores）：业务状态与调度逻辑。
- 服务层（services）：持久化、网络访问、外部资源。
- 工具与类型（utils/types）：通用工具与数据结构定义。

### 3.3 关键模块职责

Stores

- `stores/grid-items.ts`：
  - 书签/文件夹 CRUD
  - 根级顺序与 gridPosition
  - 批量操作（删除、移动）
  - 旧数据迁移
- `stores/settings.ts`：设置读写与默认值合并。
- `stores/wallpaper.ts`：壁纸加载、缓存、预加载、切换。
- `stores/ui.ts`：上下文菜单、模态框、编辑模式与选中状态。

Services

- `services/database.ts`：Dexie 封装，统一 IndexedDB 存取；导入/导出。
- `services/webdav.ts`：WebDAV 备份/恢复/删除 + 加密配置保存。
- `services/wallpaper-service.ts` / `services/wallpaper-provider.ts`：多壁纸源的统一接口与 fallback。
- `services/favicon.ts`：favicon 获取与缓存（Google S2 → favicon.ico → 默认 SVG）。

Components

- `components/TabGrid.vue`：GridStack 网格渲染与位置同步。
- `components/BookmarkCard.vue` / `components/FolderCard.vue`：卡片展示与交互。
- `components/FolderModal.vue`：文件夹弹层与内部拖拽排序。
- `components/AddSiteModal.vue` / `components/AddFolderModal.vue`：添加/编辑表单。
- `components/SettingsPanel.vue`：通用/壁纸/备份三栏设置。
- `components/ui/ContextMenu.vue`：右键菜单 + 子菜单。
- `components/EditToolbar.vue`：编辑模式工具栏。
- `components/SearchBar.vue`：搜索与快捷键支持。

### 3.4 数据模型

- `GridItem`：`site` / `folder` 公共字段。
- `SiteItem`：URL + favicon。
- `FolderItem`：size + children。
- `Settings`：搜索栏 / WebDAV / 壁纸配置。
- `WallpaperInfo`：壁纸元信息。

### 3.5 存储与缓存

- IndexedDB（Dexie）表：`bookmarks` / `settings` / `wallpapers` / `webdav` / `favicons`。
- 数据导出/导入 JSON（不含 wallpaper blob）。
- favicon Base64 缓存；壁纸 Blob 缓存（current/next）。

### 3.6 外部资源/网络依赖

- Bing 壁纸：`https://peapix.com/bing/feed`
- Picsum：`https://picsum.photos/*`
- Google favicon 服务：`https://www.google.com/s2/favicons`

## 4. 技术栈（来自 package.json 与配置）

### 4.1 构建与运行

- 包管理：Bun
- 扩展框架：WXT
- 构建工具：Vite
- 语言：TypeScript（严格模式）

### 4.2 前端

- Vue 3 + `<script setup>`
- 状态管理：Pinia
- 布局拖拽：GridStack

### 4.3 数据与网络

- IndexedDB：Dexie
- WebDAV：`webdav` SDK

### 4.4 样式与图标

- UnoCSS（预设：Uno / Icons / WebFonts）
- Iconify 图标集（lucide）

## 5. 样式风格与设计语言

- 整体主题：深色系 + 渐变背景 + 半透明磨砂（Glassmorphism）。
- 背景层级：
  - 默认深色渐变（始终可见）
  - 壁纸层（淡入动画）
  - 半透明黑色遮罩
- 组件视觉：
  - 大量使用 `glass` / `glass-hover`（透明度、模糊、柔和阴影）
  - 圆角偏大（`rounded-xl` / `rounded-2xl`）
  - 图标统一使用 lucide，轻量描边风格
- 动效：
  - 轻微缩放与淡入淡出（search、modal、menu、toolbar）
  - 编辑模式卡片轻微抖动动画
- 字体：系统字体栈（Inter/Outfit fallback），避免网络字体依赖

## 6. 重构前关键事实（建议保留的行为约束）

- 数据兼容：旧版数据迁移逻辑已存在，重构需保留或提供迁移脚本。
- 扩展合规：搜索使用 `browser.search` 优先，符合扩展商店政策。
- 可用性：壁纸失败与未启用时仍需保证可读的默认背景。
- 性能与内存：壁纸 Blob URL 需要及时释放，避免泄漏。

---

如需在此基础上生成“重构目标/边界/迁移方案/风险清单”，告诉我你期望的输出格式与颗粒度。
