## ADDED Requirements

### Requirement: 模态框打开方式

`NSettingModal` SHALL 导出 `open` 方法打开设置面板。

#### Scenario: 打开设置

- **WHEN** 调用 `open()` 方法
- **THEN** 设置模态框打开，显示当前设置值

### Requirement: 搜索栏设置

设置面板 SHALL 包含搜索栏显示开关。

#### Scenario: 切换搜索栏显示

- **WHEN** 用户切换搜索栏开关
- **THEN** 设置值更新，页面上的搜索栏显示/隐藏

### Requirement: 壁纸设置

设置面板 SHALL 包含壁纸相关设置：

- 启用壁纸开关
- 壁纸轮播间隔（当启用壁纸时）

#### Scenario: 切换壁纸启用

- **WHEN** 用户切换壁纸开关
- **THEN** 设置值更新，壁纸功能启用/禁用

#### Scenario: 设置轮播间隔

- **WHEN** 用户修改轮播间隔
- **THEN** 设置值更新，壁纸按新间隔轮播

### Requirement: 数据备份

设置面板 SHALL 包含数据导入导出功能：

- 导出按钮：将数据导出为 JSON 文件
- 导入按钮：从 JSON 文件导入数据

#### Scenario: 导出数据

- **WHEN** 用户点击导出按钮
- **THEN** 下载包含所有网格项数据的 JSON 文件

#### Scenario: 导入数据

- **WHEN** 用户选择 JSON 文件并确认导入
- **THEN** 解析文件并恢复数据到 store 和数据库

### Requirement: 设置持久化

所有设置更改 SHALL 自动保存到 localStorage。

#### Scenario: 设置自动保存

- **WHEN** 用户修改任何设置项
- **THEN** 设置值立即保存到 localStorage
