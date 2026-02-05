## ADDED Requirements

### Requirement: 文件夹渲染

`NFolderItem` 组件 SHALL 接收 `FolderItem` 数据并渲染：

- 文件夹名称
- 文件夹内的网站项（使用 NSiteItem 渲染）

#### Scenario: 渲染文件夹

- **WHEN** 组件接收 FolderItem 数据
- **THEN** 显示文件夹名称和内部的网站项列表

### Requirement: 多尺寸支持

`NFolderItem` SHALL 支持三种尺寸，由 GridStack 控制：

- 1x2（1列2行）
- 2x1（2列1行）
- 2x2（2列2行）

#### Scenario: 不同尺寸渲染

- **WHEN** FolderItem 设置了特定尺寸
- **THEN** GridStack 以对应的网格大小渲染文件夹

### Requirement: 内部网站项交互

文件夹内的网站项 SHALL 保持完整的交互功能：

- 点击打开网站
- 右键显示菜单

#### Scenario: 点击文件夹内网站

- **WHEN** 用户点击文件夹内的网站项
- **THEN** 打开对应网站 URL

### Requirement: 右键菜单

用户右键点击文件夹空白区域时 SHALL 显示上下文菜单：

- 编辑文件夹（打开 folder-modal）
- 添加网站
- 删除文件夹

#### Scenario: 右键显示文件夹菜单

- **WHEN** 用户右键点击文件夹空白区域
- **THEN** 显示文件夹操作菜单
