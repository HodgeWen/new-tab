## ADDED Requirements

### Requirement: 模态框打开方式

`NSiteModal` SHALL 导出 `open` 方法，支持两种模式：

- 新增模式：不传参数或传空对象
- 编辑模式：传入现有 SiteItem 数据

#### Scenario: 新增模式打开

- **WHEN** 调用 `open()` 不传参数
- **THEN** 模态框以空表单打开，标题为"添加网站"

#### Scenario: 编辑模式打开

- **WHEN** 调用 `open(siteItem)` 传入现有数据
- **THEN** 模态框以填充数据的表单打开，标题为"编辑网站"

### Requirement: 表单字段

模态框 SHALL 包含以下可编辑字段：

- 网站地址（URL）
- 网站名称
- 网站图标（显示预览）

#### Scenario: 显示表单字段

- **WHEN** 模态框打开
- **THEN** 显示地址输入框、名称输入框、图标预览区域

### Requirement: 自动获取网站信息

当用户输入或修改网站地址时，如果名称和图标都为空，系统 SHALL 自动尝试获取：

- 网站标题作为名称
- 网站 favicon 作为图标（转换为 base64 格式）

#### Scenario: 自动获取成功

- **WHEN** 用户输入有效 URL，名称和图标为空
- **THEN** 系统自动填充获取到的网站标题和 favicon（base64）

#### Scenario: 图标获取失败

- **WHEN** 无法获取网站 favicon
- **THEN** 使用网站名称的第一个字符作为占位图标

### Requirement: 保存数据

点击确认按钮时 SHALL 保存数据到 store，并关闭模态框。

#### Scenario: 保存新网站

- **WHEN** 用户在新增模式下填写表单并点击确认
- **THEN** 创建新的 SiteItem 并添加到 store

#### Scenario: 更新网站

- **WHEN** 用户在编辑模式下修改表单并点击确认
- **THEN** 更新 store 中对应的 SiteItem
