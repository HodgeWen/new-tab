## 1. 实现上下文菜单 API

- [ ] 1.1 在 `shadcn/ui/context-menu/` 创建 `use-context-menu.ts`，实现 `useContextMenu` composable
- [ ] 1.2 创建 `context-menu-renderer.vue` 渲染动态菜单项
- [ ] 1.3 更新 `shadcn/ui/context-menu/index.ts`，只导出 `useContextMenu`

## 2. 完善弹框组件

- [ ] 2.1 完成 `components/folder/folder-edit.vue` 实现（参考 `site-edit.vue`）
- [ ] 2.2 更新 `utils/di.ts`，添加 `folderEdit` 到注入 key
- [ ] 2.3 在 App.vue 中注册 `folderEdit` 的 provide

## 3. 迁移 EditToolbar

- [ ] 3.1 将 `EditToolbar.vue` 功能迁移到 `edit-toolbar/edit-toolbar.vue`
- [ ] 3.2 移除 `useUI` 依赖，改用 `useUIStore`
- [ ] 3.3 更新 `edit-toolbar/index.ts` 导出

## 4. 迁移 FolderModal

- [ ] 4.1 将 `FolderModal.vue` 功能迁移到 `folder/folder-modal.vue`
- [ ] 4.2 移除 `useUI` 依赖，改用自包含模式 + `defineExpose`
- [ ] 4.3 更新调用点使用 `useTemplateRef` 或依赖注入

## 5. 迁移 SettingsPanel

- [ ] 5.1 将 `SettingsPanel.vue` 功能迁移到 `setting/setting-panel.vue`
- [ ] 5.2 移除 `useUI` 依赖，改用自包含模式 + `defineExpose`
- [ ] 5.3 在设置按钮父组件中使用 `useTemplateRef` 调用

## 6. 迁移 TabGrid

- [ ] 6.1 将 `TabGrid.vue` 功能迁移到 `grid/grid-container.vue`
- [ ] 6.2 移除 `useUI` 依赖，使用 `useContextMenu` 和依赖注入
- [ ] 6.3 更新书签卡片和文件夹卡片的右键菜单逻辑

## 7. 迁移 SearchBar

- [ ] 7.1 确认 `search/search-bar.vue` 功能完整
- [ ] 7.2 移除任何 `useUI` 依赖（如有）

## 8. 迁移书签/文件夹卡片组件

- [ ] 8.1 将 `BookmarkCard.vue` 功能合并到 `site/site-item.vue`
- [ ] 8.2 将 `FolderCard.vue` 功能合并到 `folder/folder-item.vue`
- [ ] 8.3 移除 `useUI` 依赖

## 9. 更新 App.vue

- [ ] 9.1 移除 UIContext provide 相关代码
- [ ] 9.2 更新组件导入，使用新的组件路径
- [ ] 9.3 实现全局右键菜单逻辑（使用 `useContextMenu`）
- [ ] 9.4 确保 `COMPONENTS_DI_KEY` provide 完整

## 10. 清理旧代码

- [ ] 10.1 删除 `composables/useUI.ts`
- [ ] 10.2 删除 `types/ui.ts`（或移除 UIContext 相关类型）
- [ ] 10.3 删除 `components/` 根目录下的旧组件文件：
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

## 11. 验证与修复

- [ ] 11.1 运行类型检查，修复 TypeScript 错误
- [ ] 11.2 手动测试所有功能：
  - 网站增删改
  - 文件夹增删改
  - 拖拽排序
  - 右键菜单
  - 设置面板
  - 编辑模式
- [ ] 11.3 修复发现的问题
