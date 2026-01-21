# Change: 数据持久化与 UI 状态重构

## Why

当前数据持久化方案存在以下问题：

1. Settings 存储在 IndexedDB 中，但访问频繁且数据量小，使用 localStorage 更简洁高效
2. WebDAV 配置单独存储在 `webdav` 表中，但 Settings 类型已包含 `webdav` 字段，存在冗余
3. UI 状态（右键菜单、模态框、编辑模式等）通过全局 Pinia store 管理，但这些状态本质上是组件级别的，不应该全局共享
4. FolderCard 组件的交互体验不够直观——点击整个卡片都会打开文件夹，无法快速访问预览中的网站

## What Changes

### 阶段 1：数据持久化重构

- **Settings 迁移到 localStorage**：轻量配置使用同步存储，提升访问效率
- **移除 `webdav` 表**：WebDAV 配置已在 Settings 中定义，删除冗余存储
- **简化数据库层**：`database.ts` 仅保留 IndexedDB 相关操作（gridItems、favicons、wallpapers）
- **删除 `ui` store**：将 UI 状态（contextMenu、modalType、editMode 等）下沉到组件内部，使用 provide/inject 或 props 传递
- **新增 `orders` 结构**：在 localStorage 中存储网格项的排序和层级关系，优化拖拽操作性能

### 阶段 2：FolderCard 交互增强

- **分离点击区域**：点击预览区的网站图标直接打开该网站；点击标题区域才打开文件夹详情
- **BREAKING**：改变了现有的 FolderCard 点击行为

## Impact

- Affected specs: `data-storage`（新增）, `folder-interaction`（新增）, `ui-dialog`（修改 Folder Detail Dialog 行为描述）
- Affected code:
  - `services/database.ts` — 移除 settings 和 webdav 相关方法
  - `stores/settings.ts` — 改用 localStorage
  - `stores/grid-items.ts` — 新增 orders 状态管理，优化排序操作
  - `stores/ui.ts` — 删除
  - `components/*` — 使用 ui store 的组件需要重构状态管理
  - `components/FolderCard.vue` — 重构点击交互
  - `entrypoints/newtab/App.vue` — 重构 UI 状态管理
