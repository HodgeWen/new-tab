# ui-foundation Specification

## Purpose
TBD - created by archiving change refactor-ui-shadcn-vue. Update Purpose after archive.
## Requirements
### Requirement: Tailwind CSS 4 样式系统

系统 SHALL 使用 Tailwind CSS 4 替代 UnoCSS 作为样式系统，具备以下配置：
- 使用 `@tailwindcss/vite` 插件集成到 Vite 构建
- 使用 `@import "tailwindcss"` 引入基础样式
- 使用 `@theme` 定义 Glassmorphism 相关 CSS 变量
- 使用 `@layer components` 定义可复用组件样式

#### Scenario: Vite 插件配置
- **WHEN** 项目启动或构建
- **THEN** Tailwind CSS 4 通过 Vite 插件处理所有样式
- **AND** 自动扫描模板文件生成对应 CSS

#### Scenario: 主题变量定义
- **WHEN** 在 `@theme` 中定义 `--color-glass-bg: rgba(255, 255, 255, 0.15)`
- **THEN** 可使用 `bg-glass-bg` 类应用该颜色

### Requirement: Glassmorphism 组件样式

系统 SHALL 提供以下 Glassmorphism 组件样式类：
- `glass`：基础玻璃效果（bg-white/15、backdrop-blur-xl、border-white/20、shadow-lg）
- `glass-hover`：hover 状态增强（bg-white/25、border-white/30、transition）
- `glass-dark`：深色玻璃效果（bg-black/20、backdrop-blur-xl、border-white/10）
- `glass-input`：输入框样式（bg-white/10、focus:ring-white/20）

#### Scenario: 玻璃效果应用
- **WHEN** 元素添加 `class="glass"`
- **THEN** 显示半透明背景、模糊效果、边框和阴影
- **AND** 与深色背景形成对比

#### Scenario: hover 增强效果
- **WHEN** 元素添加 `class="glass glass-hover"` 并被 hover
- **THEN** 背景透明度增加、边框更明显
- **AND** 有平滑过渡动画

### Requirement: Button 组件

系统 SHALL 提供统一的 Button 组件，支持以下变体：
- **default**: 默认样式（glass 背景）
- **primary**: 主要操作（蓝色背景）
- **ghost**: 透明背景，仅 hover 时显示
- **destructive**: 危险操作（红色）

Button 组件 SHALL 支持以下尺寸：
- **sm**: 小尺寸（px-3 py-1.5）
- **default**: 默认尺寸（px-4 py-2）
- **lg**: 大尺寸（px-6 py-3）
- **icon**: 图标按钮（p-2）

Button 组件 SHALL 支持 `disabled` 状态，表现为降低透明度且不响应交互。

#### Scenario: 默认按钮渲染
- **WHEN** 使用 `<Button>保存</Button>`
- **THEN** 渲染带有 glass 背景的按钮
- **AND** hover 时背景变亮

#### Scenario: 主要按钮渲染
- **WHEN** 使用 `<Button variant="primary">确认</Button>`
- **THEN** 渲染蓝色背景按钮
- **AND** hover 时背景加深

#### Scenario: 禁用状态
- **WHEN** 使用 `<Button disabled>提交</Button>`
- **THEN** 按钮显示为半透明
- **AND** 点击无响应

### Requirement: Input 组件

系统 SHALL 提供统一的 Input 组件，具备以下特性：
- 支持 `type` 属性（text、password、url、email）
- 支持 `placeholder` 属性
- 支持 `disabled` 状态
- 支持 `v-model` 双向绑定

Input 组件 SHALL 应用 Glassmorphism 样式：
- 背景：`bg-white/10`
- 边框：`border-white/10`
- 聚焦时：`ring-2 ring-white/20`
- 占位符：`placeholder-white/40`

#### Scenario: 文本输入
- **WHEN** 使用 `<Input v-model="value" placeholder="请输入" />`
- **THEN** 渲染带有 glass 样式的输入框
- **AND** 聚焦时显示 focus ring

#### Scenario: 密码输入
- **WHEN** 使用 `<Input type="password" />`
- **THEN** 输入内容以掩码显示

### Requirement: Separator 组件

系统 SHALL 提供 Separator 组件用于视觉分隔，支持：
- **horizontal**: 水平分隔线（默认）
- **vertical**: 垂直分隔线

Separator SHALL 使用 `border-white/10` 颜色以匹配 Glassmorphism 风格。

#### Scenario: 水平分隔
- **WHEN** 使用 `<Separator />`
- **THEN** 渲染水平的半透明分隔线

#### Scenario: 垂直分隔
- **WHEN** 使用 `<Separator orientation="vertical" />`
- **THEN** 渲染垂直的半透明分隔线

### Requirement: ScrollArea 组件

系统 SHALL 提供 ScrollArea 组件用于自定义滚动区域，具备：
- 自定义滚动条样式（半透明、圆角）
- 支持垂直和水平滚动
- 平滑滚动行为

ScrollArea SHALL 隐藏原生滚动条，使用自定义样式以匹配 Glassmorphism 风格。

#### Scenario: 垂直滚动区域
- **WHEN** 内容超出 ScrollArea 容器高度
- **THEN** 显示自定义垂直滚动条
- **AND** 滚动条为半透明圆角样式

#### Scenario: 滚动条交互
- **WHEN** 鼠标 hover 滚动条
- **THEN** 滚动条透明度增加
- **AND** 可拖拽滚动

### Requirement: cn 工具函数

系统 SHALL 在 `shadcn/lib/utils.ts` 提供 `cn` 工具函数用于合并 CSS 类名，具备：
- 支持条件类名（通过 clsx）
- 自动合并 Tailwind 冲突类（通过 tailwind-merge）

#### Scenario: 类名合并
- **WHEN** 调用 `cn('px-4 py-2', 'px-6', { 'bg-white': true })`
- **THEN** 返回 `'px-6 py-2 bg-white'`
- **AND** 冲突的 `px-4` 被 `px-6` 覆盖

### Requirement: z-index 层级体系

系统 SHALL 建立统一的 z-index 层级常量：
- `Z_TOOLBAR = 10`: 编辑模式工具栏
- `Z_FIXED = 20`: 固定元素
- `Z_DROPDOWN = 40`: 下拉菜单、Tooltip
- `Z_MODAL = 50`: Modal / Dialog
- `Z_CONTEXT = 60`: 右键菜单
- `Z_TOAST = 70`: Toast 通知

所有弹出层组件 SHALL 使用这些常量而非硬编码值。

#### Scenario: 层级覆盖
- **WHEN** Modal 打开时显示右键菜单
- **THEN** 右键菜单（z-60）显示在 Modal（z-50）之上

