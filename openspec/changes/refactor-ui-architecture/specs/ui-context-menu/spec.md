## ADDED Requirements

### Requirement: useContextMenu API

系统 SHALL 提供 `useContextMenu` composable 用于命令式显示上下文菜单。

API 签名：
```typescript
interface ContextMenuItem {
  icon?: Component
  label: string
  action: () => void | Promise<void>
  danger?: boolean
  disabled?: boolean
}

interface ContextMenuDivider {
  type: 'divider'
}

interface ContextMenuSubmenu {
  type: 'submenu'
  icon?: Component
  label: string
  items: ContextMenuItem[]
}

type ContextMenuItemConfig = ContextMenuItem | ContextMenuDivider | ContextMenuSubmenu

interface ShowOptions {
  x: number
  y: number
  items: ContextMenuItemConfig[]
}

function useContextMenu(): {
  show: (options: ShowOptions) => void
  hide: () => void
}
```

`useContextMenu` SHALL 具备以下特性：
- 支持动态配置菜单项
- 支持分隔线、子菜单
- 支持危险操作样式
- 支持禁用状态
- 自动处理视口边界

#### Scenario: 动态菜单项
- **WHEN** 调用 `show({ x, y, items })` 传入不同的菜单配置
- **THEN** 根据配置渲染对应的菜单项
- **AND** 菜单在指定位置显示

#### Scenario: 菜单项操作
- **WHEN** 点击菜单项
- **THEN** 执行该菜单项的 `action` 回调
- **AND** 菜单自动关闭

#### Scenario: 子菜单展开
- **WHEN** hover 带有 `type: 'submenu'` 的菜单项
- **THEN** 显示该项的子菜单
- **AND** 子菜单显示在父菜单右侧

#### Scenario: 关闭菜单
- **WHEN** 点击菜单外部、按 ESC、或调用 `hide()`
- **THEN** 菜单关闭

### Requirement: ContextMenu 渲染组件

系统 SHALL 提供 `ContextMenuRenderer` 组件用于渲染动态菜单。

该组件 SHALL：
- 作为 `useContextMenu` 的内部实现
- 在 App 级别挂载一次
- 支持 Teleport 到 body

#### Scenario: 全局挂载
- **WHEN** App.vue 挂载 `ContextMenuRenderer`
- **THEN** `useContextMenu` 可在任意组件中使用
- **AND** 菜单渲染在 body 下

## MODIFIED Requirements

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

**注意**：这些子组件仅作为内部实现使用，不再对外导出。推荐使用 `useContextMenu` API。

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

## REMOVED Requirements

### Requirement: 空白区域右键菜单

**Reason**: 菜单内容现在由调用方动态配置，不再作为固定规格。
**Migration**: 在 App.vue 中使用 `useContextMenu` 并传入相应菜单项配置。

### Requirement: 网站卡片右键菜单

**Reason**: 菜单内容现在由调用方动态配置，不再作为固定规格。
**Migration**: 在 TabGrid/site-item 组件中使用 `useContextMenu` 并传入相应菜单项配置。

### Requirement: 文件夹卡片右键菜单

**Reason**: 菜单内容现在由调用方动态配置，不再作为固定规格。
**Migration**: 在 TabGrid/folder-item 组件中使用 `useContextMenu` 并传入相应菜单项配置。
