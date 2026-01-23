# Change: 重构 UI 架构 - 废弃 useUI 并优化组件结构

## Why

当前 UI 状态管理分散在多处（`useUI` composable、`UIContext` provide/inject、`useUIStore`），导致：
- 心智负担重：开发者需要理解多种状态管理方式
- 职责不清：弹框控制逻辑与状态混在一起
- 可维护性差：相似的逻辑散落在不同文件中

重构后将：
- 统一全局状态到 `useUIStore`
- 弹框控制逻辑内聚到各自组件，通过 `open` 方法暴露
- 上下文菜单改为命令式 API 调用，支持动态配置
- 清理冗余组件，统一使用子文件夹组织结构

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

## Impact

- Affected specs: `ui-menu`, `ui-dialog`
- Affected code:
  - `composables/useUI.ts` - 删除
  - `types/ui.ts` - 删除
  - `stores/ui.ts` - 保持（已完成）
  - `utils/di.ts` - 扩展（添加 `folderEdit`）
  - `entrypoints/newtab/App.vue` - 大幅简化
  - `shadcn/ui/context-menu/` - 添加 API
  - `components/` 下所有使用 `useUI` 的组件
  - `components/` 根目录旧组件 - 删除（迁移后）
