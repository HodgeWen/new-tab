## ADDED Requirements

### Requirement: Settings 本地存储

应用设置 SHALL 使用 localStorage 进行持久化存储，键名为 `new-tab-settings`。

设置数据结构包含：
- `showSearchBar`: 是否显示搜索栏
- `webdav`: WebDAV 配置（enabled, url, username, password）
- `wallpaper`: 壁纸配置（enabled, interval, category, source）

#### Scenario: 加载设置

- **WHEN** 应用启动时调用 `loadSettings()`
- **THEN** 从 localStorage 读取设置
- **AND** 与默认设置深度合并，确保新增字段有默认值

#### Scenario: 保存设置

- **WHEN** 调用 `saveSettings()` 或更新设置方法
- **THEN** 将当前设置 JSON 序列化后写入 localStorage

#### Scenario: 首次运行

- **WHEN** localStorage 中不存在设置数据
- **THEN** 使用默认设置
- **AND** 不主动写入 localStorage（等待用户修改时再保存）

### Requirement: Orders 排序结构

应用 SHALL 使用 localStorage 存储网格项的排序和层级关系，键名为 `new-tab-orders`。

数据结构为二维数组：
```typescript
type Orders = [string, string[]][]
// [itemId, childIds[]]
```

- 第一个元素为网格项 ID
- 第二个元素为子项 ID 数组（文件夹有子项，网站为空数组）
- 数组顺序即为显示顺序

#### Scenario: 加载 orders

- **WHEN** 应用启动时调用 `loadOrders()`
- **THEN** 从 localStorage 读取 orders
- **AND** 如果不存在，则从 gridItems 构建初始 orders

#### Scenario: 拖拽排序

- **WHEN** 用户拖拽网格项改变位置
- **THEN** 仅更新内存中的 orders 状态
- **AND** 拖拽结束后保存 orders 到 localStorage

#### Scenario: 同步到 gridItems

- **WHEN** 调用 `syncOrdersToGridItems()`
- **THEN** 根据 orders 批量更新 gridItems 表的 order 和 parentId 字段

#### Scenario: 新增网格项

- **WHEN** 添加新的网站或文件夹
- **THEN** 同步更新 orders（追加到末尾或指定位置）

#### Scenario: 删除网格项

- **WHEN** 删除网站或文件夹
- **THEN** 从 orders 中移除对应条目
- **AND** 如果是文件夹，同时移除其子项引用

### Requirement: IndexedDB 数据存储

以下数据 SHALL 使用 IndexedDB (Dexie) 存储：

- `gridItems`: 网格项数据（网站、文件夹）
- `favicons`: 网站图标缓存（Base64）
- `wallpapers`: 壁纸缓存（Blob）

#### Scenario: 网格项存储

- **WHEN** 添加、编辑或删除网格项
- **THEN** 数据持久化到 IndexedDB `gridItems` 表

#### Scenario: Favicon 缓存

- **WHEN** 获取网站图标成功
- **THEN** Base64 数据缓存到 IndexedDB `favicons` 表

#### Scenario: 壁纸缓存

- **WHEN** 下载壁纸成功
- **THEN** Blob 数据缓存到 IndexedDB `wallpapers` 表
- **AND** 存储 `current` 和 `next` 两个槽位

### Requirement: UI 状态组件化

UI 状态（右键菜单、模态框、编辑模式等）SHALL 通过 Vue provide/inject 在组件树中传递，不使用全局 store。

提供的状态注入点：
- `contextMenu`: 右键菜单状态和控制方法
- `editMode`: 编辑模式状态（isEditMode, selectedIds）和控制方法
- `modalState`: 模态框状态和控制方法
- `openFolder`: 当前打开的文件夹 ID

#### Scenario: 右键菜单状态

- **WHEN** 在网格区域右键点击
- **THEN** 通过 inject 获取的 `contextMenu.open()` 方法打开菜单
- **AND** 菜单组件通过 inject 获取状态进行渲染

#### Scenario: 编辑模式切换

- **WHEN** 点击编辑按钮
- **THEN** 通过 inject 获取的 `editMode.toggle()` 切换编辑状态
- **AND** TabGrid 和 EditToolbar 通过 inject 响应状态变化

#### Scenario: 模态框控制

- **WHEN** 需要打开添加/编辑模态框
- **THEN** 通过 inject 获取的 `modalState.open()` 方法控制
- **AND** 模态框组件通过 inject 获取状态决定是否渲染
