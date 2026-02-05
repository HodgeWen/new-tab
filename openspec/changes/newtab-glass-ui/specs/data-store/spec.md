## ADDED Requirements

### Requirement: 响应式数据存储

Store 层 SHALL 基于 Vue 响应式系统实现，不使用 Pinia。

#### Scenario: 响应式数据更新

- **WHEN** store 中的数据变化
- **THEN** 依赖该数据的组件自动重新渲染

### Requirement: 网格项数据管理

`store/grid-items.ts` SHALL 管理所有网格项数据，包括：

- SiteItem 列表
- FolderItem 列表
- 网格位置信息

#### Scenario: 获取网格项

- **WHEN** 组件需要渲染网格
- **THEN** 从 store 获取完整的 gridItems 数据

### Requirement: 初始化数据加载

Store SHALL 在应用启动时从持久化存储加载数据：

- 从 Dexie 数据库加载 gridItems
- 从 localStorage 加载设置

#### Scenario: 应用启动加载数据

- **WHEN** 应用启动
- **THEN** 从数据库和 localStorage 加载数据到 store

### Requirement: 数据同步

Store 中的数据变化 SHALL 自动同步到持久化存储。

#### Scenario: 添加网格项

- **WHEN** 用户添加新的网站或文件夹
- **THEN** store 更新并同步到数据库

#### Scenario: 更新网格项

- **WHEN** 用户编辑网站或文件夹
- **THEN** store 更新并同步到数据库

#### Scenario: 删除网格项

- **WHEN** 用户删除网站或文件夹
- **THEN** store 更新并从数据库删除

### Requirement: CRUD 操作

Store SHALL 提供完整的 CRUD 操作方法：

- `addItem(item)` - 添加网格项
- `updateItem(id, data)` - 更新网格项
- `removeItem(id)` - 删除网格项
- `getItem(id)` - 获取单个网格项

#### Scenario: 调用 CRUD 方法

- **WHEN** 组件调用 store 的 CRUD 方法
- **THEN** 数据正确更新并持久化
