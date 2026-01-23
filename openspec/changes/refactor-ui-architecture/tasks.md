## 1. 数据层优化

- [x] 1.1 移除 `services/database.ts` 中的 `favicons` 表定义和相关方法
- [x] 1.2 简化 `services/favicon.ts`，移除缓存相关逻辑，只保留 `getFaviconUrl` 和 `generateDefaultIcon`
- [x] 1.3 重构 `stores/settings.ts`：
  - 移除 `loadSettings`、`loading`、`saveSettings` 等方法
  - 内部自动初始化
  - 使用 `watch` 深度监听自动持久化
  - 只暴露 `settings` 属性
- [x] 1.4 重构 `stores/grid-items.ts`：
  - 移除文件夹嵌套相关的容错逻辑
  - 简化 `addFolder`，移除 `pid` 处理
  - 确保 `moveGridItem` 和 `batchMoveToFolder` 只允许 site 移入文件夹

## 2. 实现上下文菜单 API

- [x] 2.1 在 `shadcn/ui/context-menu/` 创建 `use-context-menu.ts`，实现 `useContextMenu` composable
- [x] 2.2 创建 `context-menu-renderer.vue` 渲染动态菜单项
- [x] 2.3 更新 `shadcn/ui/context-menu/index.ts`，只导出 `useContextMenu`

## 3. 完善弹框组件

- [x] 3.1 完成 `components/folder/folder-edit.vue` 实现（参考 `site-edit.vue`）
- [x] 3.2 更新 `utils/di.ts`，添加 `folderEdit` 到注入 key
- [x] 3.3 在 App.vue 中注册 `folderEdit` 的 provide

## 4. 迁移 EditToolbar

- [x] 4.1 将 `EditToolbar.vue` 功能迁移到 `edit-toolbar/edit-toolbar.vue`
- [x] 4.2 移除 `useUI` 依赖，改用 `useUIStore`
- [x] 4.3 更新 `edit-toolbar/index.ts` 导出

## 5. 迁移 FolderModal

- [x] 5.1 将 `FolderModal.vue` 功能迁移到 `folder/folder-modal.vue`
- [x] 5.2 移除 `useUI` 依赖，改用自包含模式 + `defineExpose`
- [x] 5.3 更新调用点使用 `useTemplateRef` 或依赖注入

## 6. 迁移 SettingsPanel

- [x] 6.1 将 `SettingsPanel.vue` 功能迁移到 `setting/setting-panel.vue`
- [x] 6.2 移除 `useUI` 依赖，改用自包含模式 + `defineExpose`
- [x] 6.3 在设置按钮父组件中使用 `useTemplateRef` 调用

## 7. 迁移 TabGrid

- [x] 7.1 将 `TabGrid.vue` 功能迁移到 `grid/grid-container.vue`
- [x] 7.2 移除 `useUI` 依赖，使用 `useContextMenu` 和依赖注入
- [x] 7.3 更新书签卡片和文件夹卡片的右键菜单逻辑

## 8. 迁移 SearchBar

- [x] 8.1 确认 `search/search-bar.vue` 功能完整
- [x] 8.2 移除任何 `useUI` 依赖（如有）

## 9. 迁移书签/文件夹卡片组件

- [x] 9.1 将 `BookmarkCard.vue` 功能合并到 `site/site-item.vue`
- [x] 9.2 将 `FolderCard.vue` 功能合并到 `folder/folder-item.vue`
- [x] 9.3 移除 `useUI` 依赖

## 10. 更新 App.vue

- [x] 10.1 移除 UIContext provide 相关代码
- [x] 10.2 更新组件导入，使用新的组件路径
- [x] 10.3 实现全局右键菜单逻辑（使用 `useContextMenu`）
- [x] 10.4 确保 `COMPONENTS_DI_KEY` provide 完整
- [x] 10.5 移除 `loadSettings` 调用（改为 store 内部自动初始化）

## 11. 清理旧代码

- [x] 11.1 删除 `composables/useUI.ts`
- [x] 11.2 删除 `types/ui.ts`（或移除 UIContext 相关类型）
- [x] 11.3 删除 `components/` 根目录下的旧组件文件：
  - `AddFolderModal.vue`
  - `AddSiteModal.vue`
  - `BookmarkCard.vue`
  - `ContextMenu.vue`
  - `EditToolbar.vue`
  - `FolderCard.vue`
  - `FolderModal.vue`
  - `SearchBar.vue`
  - `SettingsPanel.vue`
  - `TabGrid.vue`

## 12. 验证与修复

- [ ] 12.1 运行类型检查，修复 TypeScript 错误
- [ ] 12.2 手动测试所有功能：
  - 网站增删改
  - 文件夹增删改
  - 拖拽排序
  - 右键菜单
  - 设置面板
  - 编辑模式
  - 设置自动保存
- [ ] 12.3 修复发现的问题
