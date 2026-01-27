## ADDED Requirements

### Requirement: ContextMenu 命令式 API
系统 SHALL 提供可导入的 `contextmenu.show(config)` API，用于在指定坐标显示右键菜单，并支持可选上下文数据传递给菜单动作。

#### Scenario: 调用 show 显示菜单
- **WHEN** 调用 `contextmenu.show` 并传入 `x`、`y`、`items`
- **THEN** 系统在对应坐标显示 ContextMenu
- **AND** 菜单项与 `items` 的标签、图标一致

#### Scenario: 菜单动作接收上下文
- **WHEN** 调用 `contextmenu.show` 时传入 `context`
- **AND** 用户点击菜单项触发 `action`
- **THEN** 系统将 `context` 作为参数传入该 `action`

#### Scenario: 无需手动挂载渲染器
- **WHEN** 应用未显式挂载 ContextMenu 渲染器时调用 `contextmenu.show`
- **THEN** ContextMenu 仍可正常显示
