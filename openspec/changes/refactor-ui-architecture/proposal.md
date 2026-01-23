# Change: 重构 UI 架构与数据层优化

## Why

当前存在多个架构问题需要解决：

**UI 状态管理问题**：
- 状态分散在多处（`useUI` composable、`UIContext` provide/inject、`useUIStore`）
- 心智负担重：开发者需要理解多种状态管理方式
- 职责不清：弹框控制逻辑与状态混在一起

**数据层问题**：
- `favicons` 表冗余，favicon 已存储在 gridItems 中
- Settings store 接口臃肿，暴露过多内部方法
- Grid-items store 包含不必要的文件夹嵌套逻辑

重构后将：
- 统一全局状态到 `useUIStore`
- 弹框控制逻辑内聚到各自组件，通过 `open` 方法暴露
- 上下文菜单改为命令式 API 调用，支持动态配置
- 清理冗余组件，统一使用子文件夹组织结构
- 简化数据层，移除冗余逻辑

## What Changes

### 1. 废弃 `composables/useUI.ts` 和 `types/ui.ts`
- **BREAKING**: 移除 `useUI()` composable 和 `UIContext` 类型
- 全局状态已在 `useUIStore` 中实现（`isEditMode`, `checkedSites` 等）

### 2. 重构弹框组件为自包含模式
- 每个弹框组件管理自己的 `visible` 状态
- 通过 `defineExpose({ open })` 暴露打开方法
- 需要跨组件调用的弹框使用依赖注入（`SiteEdit`, `FolderEdit`）
- 局部使用的弹框使用 `useTemplateRef` 直接访问

### 3. 重构上下文菜单为命令式 API
- **BREAKING**: 废弃 `components/ContextMenu.vue`
- 在 `shadcn/ui/context-menu/` 添加 `useContextMenu` API
- 支持动态菜单项配置
- 不再导出原有组件，改为导出 API 方法

### 4. 清理并重组组件结构
- **BREAKING**: 删除 `components/` 根目录下的旧组件
- 保留子文件夹中的组件（如 `edit-toolbar/edit-toolbar.vue`）
- 迁移功能后再删除旧文件

### 5. 移除 `favicons` 表
- **BREAKING**: 删除 `services/database.ts` 中的 `favicons` 表定义
- 删除 `getFavicon`/`saveFavicon` 方法
- 直接使用 `SiteItem.favicon` 字段存储 favicon URL
- 简化 `services/favicon.ts`，移除缓存相关逻辑

### 6. 优化 Settings Store
- **BREAKING**: 移除 `loadSettings`、`loading`、`saveSettings`、`toggleSearchBar`、`updateSettings`、`updateWallpaperSettings`、`updateWebDAVSettings`
- 只暴露 `settings` 响应式属性
- 内部自动调用 `loadSettings` 初始化
- 使用 `watch` 深度监听 `settings` 变化，自动同步到 localStorage

### 7. 优化 Grid-items Store
- 简化数据结构，生成与 GridStack 布局一致的结构
- **BREAKING**: 移除文件夹嵌套相关逻辑（只有 `site` 能移入文件夹）
- 移除 `FolderItem.children` 字段，改用 `orders` 结构管理层级关系

## Impact

- Affected specs: `ui-menu`, `ui-dialog`, 新增 `data-layer`
- Affected code:
  - `composables/useUI.ts` - 删除
  - `types/ui.ts` - 删除
  - `types/index.ts` - 修改（移除 FolderItem.children）
  - `stores/ui.ts` - 保持（已完成）
  - `stores/settings.ts` - 大幅简化
  - `stores/grid-items.ts` - 简化嵌套逻辑
  - `services/database.ts` - 移除 favicons 表
  - `services/favicon.ts` - 简化
  - `utils/di.ts` - 扩展（添加 `folderEdit`）
  - `entrypoints/newtab/App.vue` - 大幅简化
  - `shadcn/ui/context-menu/` - 添加 API
  - `components/` 下所有使用 `useUI` 的组件
  - `components/` 根目录旧组件 - 删除（迁移后）
