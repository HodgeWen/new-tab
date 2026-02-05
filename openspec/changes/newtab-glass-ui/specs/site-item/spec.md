## ADDED Requirements

### Requirement: 网站项渲染

`NSiteItem` 组件 SHALL 接收 `SiteItem` 数据并渲染网站项，显示：

- 网站图标（base64 图片或文字首字）
- 网站名称

#### Scenario: 渲染带图标的网站项

- **WHEN** 组件接收包含 base64 图标的 SiteItem 数据
- **THEN** 显示图标图片和网站名称

#### Scenario: 渲染无图标的网站项

- **WHEN** 组件接收没有图标的 SiteItem 数据
- **THEN** 显示名称的第一个字符作为占位图标，并显示网站名称

### Requirement: 双重渲染上下文

`NSiteItem` 组件 SHALL 支持在两种上下文中渲染：

- 直接由 GridStack 作为网格项渲染
- 在 `NFolderItem` 组件内部渲染

#### Scenario: 在 GridStack 中渲染

- **WHEN** GridStack 渲染网站项类型的 GridItem
- **THEN** 使用 `NSiteItem` 组件渲染，尺寸由 GridStack 控制

#### Scenario: 在文件夹中渲染

- **WHEN** FolderItem 包含子网站项
- **THEN** FolderItem 内部使用 `NSiteItem` 渲染这些子项

### Requirement: 点击打开网站

用户点击 `NSiteItem` 时 SHALL 在当前标签页打开对应网站 URL。

#### Scenario: 点击打开网站

- **WHEN** 用户点击网站项
- **THEN** 当前标签页导航到网站的 URL

### Requirement: 右键菜单

用户右键点击 `NSiteItem` 时 SHALL 显示上下文菜单，包含：

- 编辑（打开 site-modal）
- 删除

#### Scenario: 右键显示菜单

- **WHEN** 用户右键点击网站项
- **THEN** 显示包含"编辑"和"删除"选项的上下文菜单
