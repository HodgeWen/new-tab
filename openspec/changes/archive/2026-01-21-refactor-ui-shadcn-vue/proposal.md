# Change: 重构 UI 层至 shadcn-vue + Tailwind CSS 4

## Why

当前项目的 UI 组件全部为手写实现，存在以下问题：

- 组件样式与交互逻辑混合，难以复用和维护
- 缺乏标准化的组件 API，各组件风格不一致
- 表单控件（Switch、Select）、弹层（Modal）、菜单（ContextMenu）等基础交互缺乏可访问性支持
- UnoCSS 与 shadcn-vue 默认样式体系存在差异，需要额外适配

引入 shadcn-vue + Tailwind CSS 4 可以：

- 提供经过验证的组件结构与交互模式
- 与 shadcn-vue 原生样式体系完全兼容
- 使用 Tailwind CSS 4 的 `@theme` 重新实现 Glassmorphism 视觉风格
- 提升组件的可访问性（keyboard navigation、focus trap、ARIA）

## What Changes

### 阶段 0：样式系统迁移

- **移除 UnoCSS**，替换为 **Tailwind CSS 4**
- 安装 `@tailwindcss/vite` 插件
- 使用 `@theme` 定义 Glassmorphism 相关 CSS 变量
- 重新实现 `glass`、`glass-hover` 等玻璃效果样式

### 阶段 1：基础设施

- 引入 shadcn-vue 依赖与目录结构（`shadcn/`）
- 配置 `cn` 工具函数（clsx + tailwind-merge）
- 配置 shadcn-vue 使用 Tailwind CSS 4 主题变量
- 引入基础组件：`Button`、`Input`、`Separator`、`ScrollArea`

### 阶段 2：表单类组件

- 引入 `Select`、`Switch`、`Tabs` 组件
- 重构 `SearchBar.vue`：使用 `Input` + `Button`
- 重构 `SettingsPanel.vue`：
  - Tab 切换 → `Tabs`
  - 开关 → `Switch`
  - 下拉 → `Select`
  - 滚动区 → `ScrollArea`

### 阶段 3：弹层组件

- 引入 `Dialog` 或 `Sheet` 组件
- 重构 `AddSiteModal.vue`、`AddFolderModal.vue`、`FolderModal.vue`
- 统一 focus trap 与 ESC 关闭行为

### 阶段 4：菜单组件

- 引入 `ContextMenu`、`DropdownMenu` 组件
- 重构 `ContextMenu.vue`：使用 shadcn `ContextMenu` + `Sub` 结构
- 重构 `EditToolbar.vue`："移入分组"改为 `DropdownMenu`

### 阶段 5：统一与清理

- 统一按钮样式（`BookmarkCard`、`FolderCard` 内的操作按钮）
- 删除未使用的自定义样式
- 统一 z-index 层级体系
- 检查 focus-visible 与键盘可达性

## Impact

- **Affected specs**:

  - ui-foundation（新增）
  - ui-dialog（新增）
  - ui-menu（新增）
  - ui-form（新增）

- **Affected code**:

  - `components/*.vue`（所有组件）
  - `shadcn/`（新增 shadcn 组件目录）
  - `uno.config.ts`（删除）
  - `vite.config.ts`（添加 @tailwindcss/vite 插件）
  - `assets/styles/`（新增 Tailwind CSS 4 样式文件）
  - `package.json`（移除 UnoCSS，新增 tailwindcss、@tailwindcss/vite、reka-ui 等）

- **Breaking changes**: 无（仅 UI 层重构，API 不变）

- **Constraints preserved**:
  - 数据兼容：不改动 stores/services
  - 扩展合规：搜索使用 `browser.search` 优先
  - 可用性：壁纸失败回退逻辑保持
  - 性能：Blob URL 释放逻辑保持
