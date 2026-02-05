## ADDED Requirements

### Requirement: API 调用方式

`NContextMenu` SHALL 通过 API 方式调用，而非声明式组件。

#### Scenario: 显示上下文菜单

- **WHEN** 调用 `showContextMenu(options)` 方法
- **THEN** 在指定位置显示上下文菜单

### Requirement: 菜单配置

API SHALL 接受以下配置：

- `x, y` - 菜单显示位置
- `items` - 菜单项数组，每项包含 `label`、`action`、可选的 `icon`

#### Scenario: 配置菜单项

- **WHEN** 调用 API 传入菜单项配置
- **THEN** 菜单显示配置的选项

### Requirement: 点击执行

用户点击菜单项时 SHALL 执行对应的 action 回调。

#### Scenario: 点击菜单项

- **WHEN** 用户点击某个菜单项
- **THEN** 执行该项的 action 回调函数，菜单关闭

### Requirement: 自动关闭

菜单 SHALL 在以下情况自动关闭：

- 点击菜单项后
- 点击菜单外部区域
- 按下 Escape 键

#### Scenario: 点击外部关闭

- **WHEN** 用户点击菜单外部区域
- **THEN** 菜单关闭

#### Scenario: Escape 关闭

- **WHEN** 用户按下 Escape 键
- **THEN** 菜单关闭

### Requirement: 位置自适应

菜单 SHALL 自动调整位置，避免超出视口边界。

#### Scenario: 边界自适应

- **WHEN** 菜单显示位置靠近视口边缘
- **THEN** 菜单自动调整位置，确保完全可见
