# shadcn-vue 组件迁移方案

## 1. 目标与范围

- 目标：以 shadcn-vue 作为基础组件结构与交互层，视觉统一通过玻璃化样式覆盖实现，保留现有交互/业务逻辑与 Glassmorphism 风格。
- 范围：仅迁移 UI 层（`components/**` 与 `components/ui/**`），不改动 stores/services 的业务逻辑与数据结构。
- 保持约束：
  - 搜索仍优先使用 `browser.search`（扩展合规）。
  - 壁纸失败回退与 Blob 释放逻辑保持。
  - 旧数据迁移逻辑保持。
- 非目标：不重做业务组件结构，不更改数据模型与交互流程。

## 2. 现状梳理与迁移映射

### 2.1 现有关键组件

- 弹层类：`components/AddSiteModal.vue`、`components/AddFolderModal.vue`、`components/FolderModal.vue`、`components/SettingsPanel.vue`
- 右键菜单：`components/ContextMenu.vue`
- 表单输入：`components/SearchBar.vue`、设置面板内各种 `input/select`
- 工具条：`components/EditToolbar.vue`
- 卡片：`components/BookmarkCard.vue`、`components/FolderCard.vue`
- 网格：`components/TabGrid.vue`

### 2.2 shadcn-vue 组件映射建议

- Dialog/Sheet：替换所有模态框（AddSite/AddFolder/Folder/Settings）。
- Tabs：替换 SettingsPanel 内的 tab 切换。
- Switch：替换设置里的自定义开关按钮。
- Select：替换壁纸来源与轮播间隔的原生 select。
- Button：统一所有按钮样式与交互态。
- Input：统一所有输入框样式。
- ContextMenu / DropdownMenu：替换 `components/ContextMenu.vue` 与编辑工具条的“移入分组”菜单。
- ScrollArea：替换备份列表、文件夹列表等内部滚动区域。
- Separator：替换各类分割线。

> 卡片与网格布局更偏业务组件，建议保留结构，仅使用 shadcn 的基础组件（Button/Badge/Separator）进行样式统一。

## 3. 技术准备与依赖策略

### 3.1 依赖引入（计划）

- shadcn-vue 及其依赖

### 3.2 样式体系对齐

- 统一玻璃化基类（建议 `glass-surface` + `glass-hover`），作为所有 shadcn 基础组件的默认覆盖入口。
- 继续使用现有 `glass` / `glass-hover` 视觉语言，作为 shadcn 组件的 `class` 覆盖或别名。
- 统一按钮/输入/菜单的圆角、透明度、阴影与聚焦态。
- 统一交互状态：hover / active / disabled / focus-visible。

## 4. 迁移策略

### 阶段 1：基础组件接入

- 初始化 shadcn-vue 目录结构 `shadcn`。
- 引入基础组件：`Button`、`Input`、`Select`、`Switch`、`Tabs`、`Separator`、`ScrollArea`。
- 建立 `cn` 工具与主题变量（保持与现有 Glassmorphism 一致）。
- 新增统一玻璃化基类（`glass-surface`），并在基础组件 `class` 中默认挂载。
- 在非关键页面/小组件试点替换，验证样式和交互一致性。

### 阶段 2：表单类组件迁移

- `SearchBar.vue`：用 `Input` + `Button` 重构按钮与输入视觉，保留快捷键逻辑。
- `SettingsPanel.vue`：
  - Tab 切换改为 `Tabs`。
  - 开关改为 `Switch`。
  - 下拉改为 `Select`。
  - 列表滚动区改为 `ScrollArea`。
  - 按钮统一为 `Button` 变体。

### 阶段 3：弹层与菜单迁移

- `AddSiteModal.vue` / `AddFolderModal.vue` / `FolderModal.vue`：
  - 统一为 `Dialog`（或 `Sheet`）结构。
  - 处理 focus trap 与 esc 关闭一致性。
- `components/ContextMenu.vue`：
  - 用 shadcn `ContextMenu`/`DropdownMenu` 替换。
  - 子菜单使用 `Sub` 结构。
  - 保持原有禁用逻辑与 actions。

### 阶段 4：工具条与卡片统一

- `EditToolbar.vue`：
  - “移入分组”改为 `DropdownMenu`。
  - 按钮统一 `Button` 变体。
- `BookmarkCard.vue` / `FolderCard.vue`：
  - 保留布局与交互，使用 shadcn Button / Badge 等基础组件统一细节。

### 阶段 5：清理与一致性检查

- 删除未使用的自定义样式/组件。
- 检查 focus-visible、键盘可达性与 z-index 层级。
- 统一视觉 tokens 与 UI 行为。

## 5. 关键风险与对策

- UnoCSS 与 shadcn 默认 Tailwind token 不一致：
  - 对策： 不用考虑原先的样式，保持玻璃风格可以重新实现样式或者覆盖。
- Modal/ContextMenu z-index 与 Teleport 叠层冲突：
  - 对策：统一层级表，显式设置 z-index 体系。
- 交互回归（拖拽、快捷键、右键菜单）：
  - 对策：迁移后逐项回归测试，确保逻辑不变。

## 6. 验收标准

- 功能一致：添加/编辑/删除、拖拽、右键菜单、设置、备份流程无回归。
- 视觉一致：Glassmorphism 风格保持，按钮/输入/弹层与当前一致或更统一。
- 可维护性：UI 组件结构清晰，样式复用率提升，自定义样式显著减少。
