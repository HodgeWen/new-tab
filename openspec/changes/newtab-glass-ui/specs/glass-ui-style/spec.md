## ADDED Requirements

### Requirement: CSS 变量系统

系统 SHALL 在全局样式文件中定义以下 CSS 变量：

- 毛玻璃背景色（--glass-bg）
- 毛玻璃边框色（--glass-border）
- 模糊强度（--glass-blur）
- 圆角大小（--radius-sm, --radius-md, --radius-lg）
- 间距大小（--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg）
- 文字颜色（--text-primary, --text-secondary）
- 阴影样式（--shadow-sm, --shadow-md）

#### Scenario: 变量可在组件中使用

- **WHEN** 组件样式引用 CSS 变量（如 `var(--glass-bg)`）
- **THEN** 样式正确应用，无需重复定义值

### Requirement: 毛玻璃基础效果

所有卡片类组件（SiteItem、FolderItem）SHALL 具有毛玻璃效果，包括：

- 半透明背景（约 10-20% 不透明度）
- 背景模糊效果（backdrop-filter: blur）
- 细微的边框高光（1px 半透明白色边框）
- 圆角（12px）

#### Scenario: SiteItem 显示毛玻璃效果

- **WHEN** SiteItem 组件渲染在页面上
- **THEN** 组件具有半透明背景、模糊效果和边框高光

#### Scenario: FolderItem 显示毛玻璃效果

- **WHEN** FolderItem 组件渲染在页面上
- **THEN** 组件具有半透明背景、模糊效果和边框高光

### Requirement: Modal 毛玻璃效果

所有模态框（NModal、NSiteModal、NFolderModal、NSettingModal）SHALL 具有增强的毛玻璃效果：

- 更高的背景不透明度（约 30-40%）
- 更强的模糊效果
- 明显的阴影
- 居中显示，带有半透明遮罩层

#### Scenario: Modal 打开时显示毛玻璃效果

- **WHEN** 用户打开任意模态框
- **THEN** 模态框具有毛玻璃效果，背景显示半透明遮罩

### Requirement: 按钮毛玻璃效果

NButton 组件 SHALL 具有轻量毛玻璃效果：

- 透明或微透明背景
- 轻微的边框
- 图标按钮保持简洁

#### Scenario: 操作按钮显示统一风格

- **WHEN** Actions 区域的按钮渲染
- **THEN** 按钮具有一致的毛玻璃风格

### Requirement: 输入框毛玻璃效果

NInput 和 NSelect 组件 SHALL 具有毛玻璃效果：

- 半透明背景
- 边框高光
- 聚焦时边框颜色变化

#### Scenario: 输入框显示毛玻璃效果

- **WHEN** 用户查看表单输入框
- **THEN** 输入框具有毛玻璃背景和边框

### Requirement: 搜索框毛玻璃效果

Searcher 组件 SHALL 具有毛玻璃效果：

- 较大的圆角
- 半透明背景
- 居中显示在页面上方

#### Scenario: 搜索框显示毛玻璃效果

- **WHEN** 搜索框渲染在页面上
- **THEN** 搜索框具有圆角、半透明背景和模糊效果

### Requirement: 右键菜单毛玻璃效果

NContextMenu 组件 SHALL 具有毛玻璃效果：

- 紧凑的列表样式
- 半透明背景
- 圆角和阴影

#### Scenario: 右键菜单显示毛玻璃效果

- **WHEN** 用户右键点击打开菜单
- **THEN** 菜单具有毛玻璃背景和阴影效果
