# ui-menu Specification

## Purpose
TBD - created by archiving change refactor-ui-shadcn-vue. Update Purpose after archive.
## Requirements
### Requirement: ContextMenu 组件

系统 SHALL 提供 ContextMenu 组件用于右键菜单，包含以下子组件：
- `ContextMenu`: 根容器
- `ContextMenuTrigger`: 触发区域（右键点击）
- `ContextMenuContent`: 菜单内容
- `ContextMenuItem`: 菜单项
- `ContextMenuSeparator`: 分隔线
- `ContextMenuSub`: 子菜单容器
- `ContextMenuSubTrigger`: 子菜单触发项
- `ContextMenuSubContent`: 子菜单内容

ContextMenu 组件 SHALL 具备以下交互特性：
- 右键点击触发
- 键盘导航（上下方向键、Enter 选择）
- ESC 关闭
- 点击外部关闭
- 子菜单 hover 展开

ContextMenu 组件 SHALL 应用 Glassmorphism 样式：
- 菜单背景：`glass` 类
- 圆角：`rounded-xl`
- 阴影：`shadow-xl`
- 分隔线：`border-white/10`

#### Scenario: 右键触发
- **WHEN** 在触发区域右键点击
- **THEN** 在鼠标位置显示上下文菜单
- **AND** 菜单不超出视口边界

#### Scenario: 键盘导航
- **WHEN** 菜单打开时按方向键
- **THEN** 高亮移动到对应菜单项
- **AND** 按 Enter 执行选中项操作

#### Scenario: 子菜单展开
- **WHEN** hover "移动到分组"菜单项
- **THEN** 显示文件夹列表子菜单
- **AND** 子菜单显示在父菜单右侧

### Requirement: 空白区域右键菜单

系统 SHALL 在空白区域右键时显示以下菜单项：
- 新增网站
- 新增文件夹
- （分隔线）
- 设置

#### Scenario: 空白区域右键
- **WHEN** 在网格空白区域右键
- **THEN** 显示包含"新增网站"、"新增文件夹"、"设置"的菜单

### Requirement: 网站卡片右键菜单

系统 SHALL 在网站卡片右键时显示以下菜单项：
- 编辑
- 移动到分组（子菜单，列出所有可用文件夹）
- 移出分组（仅在文件夹内时显示）
- （分隔线）
- 删除（危险操作样式）

#### Scenario: 网站右键菜单
- **WHEN** 在网站卡片右键
- **THEN** 显示编辑、移动到分组、删除等选项

#### Scenario: 移动到分组
- **WHEN** 选择"移动到分组" > 目标文件夹
- **THEN** 网站移动到选中文件夹末尾

### Requirement: 文件夹卡片右键菜单

系统 SHALL 在文件夹卡片右键时显示以下菜单项：
- 编辑
- 调整尺寸（子菜单：1×2、2×2、2×1）
- （分隔线）
- 删除（危险操作样式）

#### Scenario: 调整文件夹尺寸
- **WHEN** 选择"调整尺寸" > 目标尺寸
- **THEN** 文件夹尺寸更新
- **AND** 网格布局自动调整

### Requirement: DropdownMenu 组件

系统 SHALL 提供 DropdownMenu 组件用于下拉菜单，包含以下子组件：
- `DropdownMenu`: 根容器
- `DropdownMenuTrigger`: 触发按钮
- `DropdownMenuContent`: 菜单内容
- `DropdownMenuItem`: 菜单项
- `DropdownMenuSeparator`: 分隔线
- `DropdownMenuSub`: 子菜单

DropdownMenu 组件 SHALL 具备与 ContextMenu 相同的交互特性和样式。

#### Scenario: 编辑工具栏下拉菜单
- **WHEN** 在编辑模式点击"移入分组"按钮
- **THEN** 显示文件夹列表下拉菜单

#### Scenario: 批量移动
- **WHEN** 选中多个网站后选择目标文件夹
- **THEN** 所有选中网站移动到目标文件夹

