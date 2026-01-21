# Tasks: shadcn-vue + Tailwind CSS 4 UI 重构实现清单

## 0. 样式系统迁移（UnoCSS → Tailwind CSS 4）

- [x] 0.1 安装 Tailwind CSS 4 依赖：`bun add tailwindcss @tailwindcss/vite`
- [x] 0.2 移除 UnoCSS 依赖：`bun remove unocss @unocss/preset-uno @unocss/preset-icons @unocss/preset-web-fonts @unocss/transformer-directives @unocss/transformer-variant-group`
- [x] 0.3 删除 `uno.config.ts`
- [x] 0.4 更新 `vite.config.ts`：移除 UnoCSS 插件，添加 `@tailwindcss/vite` 插件
- [x] 0.5 创建 `assets/styles/main.css`：引入 Tailwind CSS，定义 `@theme` 变量
- [x] 0.6 创建 `assets/styles/components.css`：实现 `glass`、`glass-hover` 等组件样式
- [x] 0.7 更新入口文件 `main.ts`：导入新样式文件
- [x] 0.8 建立 UnoCSS → Tailwind CSS 类名映射表
- [x] 0.9 验证基础样式：背景渐变、文字颜色、间距等

## 1. 基础设施搭建

- [x] 1.1 运行 `npx shadcn-vue@latest init` 初始化 shadcn-vue（基于 Reka UI）
- [x] 1.2 配置 `components.json`，设置 `aliases.ui` 指向 `@/shadcn/ui`
- [x] 1.3 创建 `shadcn/lib/utils.ts`，实现 `cn` 工具函数
- [x] 1.4 配置 shadcn-vue 使用 Tailwind CSS 4 主题变量
- [x] 1.5 建立 z-index 层级常量定义

## 2. 基础组件引入

- [x] 2.1 运行 `npx shadcn-vue@latest add button`，添加 glass 变体
- [x] 2.2 运行 `npx shadcn-vue@latest add input`，添加 glass 样式覆盖
- [x] 2.3 运行 `npx shadcn-vue@latest add separator`
- [x] 2.4 运行 `npx shadcn-vue@latest add scroll-area`
- [x] 2.5 在 `SettingsPanel.vue` 备份列表区域试点 `ScrollArea`

## 3. 表单控件迁移

- [x] 3.1 运行 `npx shadcn-vue@latest add select`，添加 glass 样式覆盖
- [x] 3.2 运行 `npx shadcn-vue@latest add switch`，添加 glass 样式覆盖
- [x] 3.3 运行 `npx shadcn-vue@latest add tabs`，添加 glass 样式覆盖
- [x] 3.4 重构 `SearchBar.vue`：使用 `Input` + `Button`
- [x] 3.5 重构 `SettingsPanel.vue` 通用设置 Tab：开关 → `Switch`
- [x] 3.6 重构 `SettingsPanel.vue` 壁纸设置 Tab：下拉 → `Select`
- [x] 3.7 重构 `SettingsPanel.vue` Tab 导航：使用 `Tabs`
- [x] 3.8 验证表单交互：focus、键盘导航、状态切换

## 4. 弹层组件迁移

- [x] 4.1 运行 `npx shadcn-vue@latest add dialog`，添加 glass 样式覆盖
- [x] 4.2 重构 `AddSiteModal.vue`：使用 `Dialog`
- [x] 4.3 重构 `AddFolderModal.vue`：使用 `Dialog`
- [x] 4.4 重构 `FolderModal.vue`：使用 `Dialog`
- [x] 4.5 重构 `SettingsPanel.vue`：使用 `Dialog`
- [x] 4.6 验证弹层交互：focus trap、ESC 关闭、backdrop 点击关闭

## 5. 菜单组件迁移

- [x] 5.1 运行 `npx shadcn-vue@latest add context-menu`，添加 glass 样式覆盖
- [x] 5.2 运行 `npx shadcn-vue@latest add dropdown-menu`，添加 glass 样式覆盖
- [x] 5.3 重构 `ContextMenu.vue`：使用 lucide-vue-next 图标
- [x] 5.4 实现子菜单结构（移动到分组、调整尺寸）
- [x] 5.5 重构 `EditToolbar.vue`："移入分组"改为 `DropdownMenu`
- [x] 5.6 验证菜单交互：键盘导航、子菜单展开/收起、禁用状态

## 6. 业务组件统一

- [x] 6.1 统一 `BookmarkCard.vue` 内部按钮样式
- [x] 6.2 统一 `FolderCard.vue` 内部按钮样式
- [x] 6.3 统一 `TabGrid.vue` 相关交互样式
- [x] 6.4 检查并修复 z-index 层级问题

## 7. 清理与验收

- [x] 7.1 删除未使用的自定义样式（`uno.config.ts` 中的旧 shortcuts）
- [x] 7.2 删除未使用的组件代码
- [x] 7.3 统一检查 focus-visible 状态
- [x] 7.4 统一检查键盘可达性（Tab 顺序、Enter/Space 触发）
- [x] 7.5 功能回归测试：
  - [x] 7.5.1 添加/编辑/删除网站
  - [x] 7.5.2 添加/编辑/删除文件夹
  - [x] 7.5.3 拖拽排序（根级、文件夹内）
  - [x] 7.5.4 右键菜单所有操作
  - [x] 7.5.5 编辑模式批量操作
  - [x] 7.5.6 搜索功能
  - [x] 7.5.7 设置面板所有选项
  - [x] 7.5.8 本地备份导入/导出
  - [x] 7.5.9 WebDAV 备份/恢复
- [x] 7.6 视觉一致性检查：Glassmorphism 风格保持
