## ADDED Requirements

### Requirement: 模态框打开方式

`NFolderModal` SHALL 导出 `open` 方法，支持两种模式：

- 新增模式：不传参数
- 编辑模式：传入现有 FolderItem 数据

#### Scenario: 新增模式打开

- **WHEN** 调用 `open()` 不传参数
- **THEN** 模态框以默认值打开，标题为"添加文件夹"

#### Scenario: 编辑模式打开

- **WHEN** 调用 `open(folderItem)` 传入现有数据
- **THEN** 模态框以填充数据打开，标题为"编辑文件夹"

### Requirement: 表单字段

模态框 SHALL 包含以下可编辑字段：

- 文件夹名称（文本输入）
- 文件夹尺寸（选择器：1x2、2x1、2x2）

#### Scenario: 显示表单字段

- **WHEN** 模态框打开
- **THEN** 显示名称输入框和尺寸选择器

### Requirement: 尺寸选择

尺寸选择器 SHALL 提供三个选项：

- 1x2（纵向）
- 2x1（横向）
- 2x2（方形）

#### Scenario: 选择尺寸

- **WHEN** 用户选择不同尺寸
- **THEN** 表单记录选中的尺寸值

### Requirement: 保存数据

点击确认按钮时 SHALL 保存数据到 store，并关闭模态框。

#### Scenario: 保存新文件夹

- **WHEN** 用户在新增模式下填写表单并点击确认
- **THEN** 创建新的 FolderItem 并添加到 store

#### Scenario: 更新文件夹

- **WHEN** 用户在编辑模式下修改表单并点击确认
- **THEN** 更新 store 中对应的 FolderItem
