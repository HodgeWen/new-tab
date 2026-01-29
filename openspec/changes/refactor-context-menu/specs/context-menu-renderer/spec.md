## ADDED Requirements

### Requirement: 使用 render 函数渲染菜单

系统 SHALL 使用 Vue render 函数在 ContextMenu.vue 中渲染上下文菜单。

#### Scenario: 渲染普通菜单项

- **WHEN** 调用 `showContextmenu` 传入包含普通菜单项的配置
- **THEN** 系统渲染每个菜单项
- **AND** 菜单项显示 icon（如有）和 label

#### Scenario: 渲染带子菜单的项

- **WHEN** 菜单项配置包含 `children` 数组
- **THEN** 系统递归渲染子菜单结构
- **AND** 子菜单在 hover 时展开

### Requirement: 保持 showContextmenu API 兼容

系统 SHALL 保持 `showContextmenu` 函数的签名和行为不变。

#### Scenario: 无 context 调用

- **WHEN** 调用 `showContextmenu({ x, y, items })`
- **THEN** 菜单在指定坐标显示
- **AND** 菜单项的 action 以无参形式调用

#### Scenario: 带 context 调用

- **WHEN** 调用 `showContextmenu({ x, y, context, items })`
- **THEN** 菜单在指定坐标显示
- **AND** 菜单项的 action 以 context 作为参数调用

### Requirement: 菜单定位与边界处理

系统 SHALL 确保菜单不会超出视口边界。

#### Scenario: 靠近右边界

- **WHEN** 菜单 x 坐标加菜单宽度超出视口右边界
- **THEN** 菜单向左偏移以保持在视口内

#### Scenario: 靠近下边界

- **WHEN** 菜单 y 坐标加菜单高度超出视口下边界
- **THEN** 菜单向上偏移以保持在视口内

### Requirement: 菜单关闭行为

系统 SHALL 在以下情况关闭菜单。

#### Scenario: 点击菜单项

- **WHEN** 用户点击菜单项
- **THEN** 执行该项的 action
- **AND** 关闭菜单

#### Scenario: 点击外部

- **WHEN** 用户点击菜单外部区域
- **THEN** 关闭菜单

#### Scenario: 按 Escape 键

- **WHEN** 用户按下 Escape 键
- **THEN** 关闭菜单

#### Scenario: 在外部触发新的右键菜单

- **WHEN** 用户在菜单外部区域触发右键菜单
- **THEN** 关闭当前菜单

### Requirement: DOM 容器复用

系统 SHALL 复用 DOM 容器以优化性能。

#### Scenario: 连续显示菜单

- **WHEN** 关闭菜单后 10 秒内再次调用 `showContextmenu`
- **THEN** 复用已有的 DOM 容器

#### Scenario: 长时间未使用

- **WHEN** 关闭菜单超过 10 秒后
- **THEN** 销毁 DOM 容器释放资源
