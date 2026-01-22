## 1. 阶段 1：数据持久化重构

### 1.1 Settings 迁移到 localStorage

- [x] 1.1.1 修改 `stores/settings.ts`，将 IndexedDB 操作替换为 localStorage
- [x] 1.1.2 移除对 `db.getSettings()` 和 `db.saveSettings()` 的调用
- [x] 1.1.3 简化 `loadSettings()` 为同步函数（localStorage 是同步 API）

### 1.2 清理数据库层

- [x] 1.2.1 从 `services/database.ts` 删除 `settings` 表定义和相关方法
- [x] 1.2.2 从 `services/database.ts` 删除 `webdav` 表定义和相关方法
- [x] 1.2.3 删除 `SettingsRecord` 和 `WebDAVRecord` 接口
- [x] 1.2.4 清理 `exportData()` 和 `importData()` 方法中的 settings 相关逻辑

### 1.3 实现 orders 结构

- [x] 1.3.1 定义 `Orders` 类型（`[string, string[]][]`）
- [x] 1.3.2 在 `stores/grid-items.ts` 中添加 `orders` 状态
- [x] 1.3.3 实现 `loadOrders()` —— 从 localStorage 加载，不存在则从 gridItems 构建
- [x] 1.3.4 实现 `saveOrders()` —— 保存到 localStorage
- [x] 1.3.5 实现 `syncOrdersToGridItems()` —— 根据 orders 批量更新 gridItems 的 order 和 parentId
- [x] 1.3.6 重构拖拽排序逻辑，操作 orders 而非直接操作 gridItems
- [x] 1.3.7 在添加/删除网格项时同步更新 orders

### 1.4 删除 ui store

- [x] 1.4.1 在 `App.vue` 中定义 UI 状态（contextMenu, modalType, editMode, selectedIds, openFolderId）
- [x] 1.4.2 创建 provide 注入点，定义 InjectionKey 和类型
- [x] 1.4.3 重构 `TabGrid.vue` 使用 inject 获取 UI 状态
- [x] 1.4.4 重构 `ContextMenu.vue` 使用 inject
- [x] 1.4.5 重构 `FolderModal.vue` 使用 inject
- [x] 1.4.6 重构 `AddSiteModal.vue` 使用 inject
- [x] 1.4.7 重构 `AddFolderModal.vue` 使用 inject
- [x] 1.4.8 重构 `SettingsPanel.vue` 使用 inject
- [x] 1.4.9 重构 `EditToolbar.vue` 使用 inject
- [x] 1.4.10 删除 `stores/ui.ts` 文件

### 1.5 验证与测试

- [x] 1.5.1 验证 Settings 读写正常（搜索栏、壁纸、WebDAV 配置）
- [x] 1.5.2 验证 orders 加载和保存正常
- [x] 1.5.3 验证拖拽排序后 orders 和 gridItems 同步正确
- [x] 1.5.4 验证右键菜单功能正常
- [x] 1.5.5 验证编辑模式功能正常（进入/退出、选中、批量操作）
- [x] 1.5.6 验证所有模态框功能正常
- [x] 1.5.7 验证文件夹展开功能正常

## 2. 阶段 2：FolderCard 交互增强

### 2.1 重构 FolderCard 组件

- [x] 2.1.1 分离预览区和标题区的点击事件
- [x] 2.1.2 预览图标添加 `@click.stop` 阻止冒泡
- [x] 2.1.3 实现点击预览图标直接打开网站（`window.open`）
- [x] 2.1.4 标题区域点击触发 `openFolder` 事件
- [x] 2.1.5 添加预览图标的 hover 效果和 cursor 样式
- [x] 2.1.6 添加预览图标的 title 属性显示网站标题

### 2.2 更新 TabGrid 集成

- [x] 2.2.1 更新 `TabGrid.vue` 中 FolderCard 的事件处理
- [x] 2.2.2 确保右键菜单在任意区域仍可触发

### 2.3 验证与测试

- [x] 2.3.1 验证点击预览图标打开正确的网站
- [x] 2.3.2 验证点击标题区域打开文件夹详情
- [x] 2.3.3 验证空文件夹的点击行为（点击空白区域也应打开文件夹）
- [x] 2.3.4 验证右键菜单功能不受影响
