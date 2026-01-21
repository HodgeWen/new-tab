# UI Dialog Specification

## ADDED Requirements

### Requirement: Dialog 组件

系统 SHALL 提供 Dialog 组件用于模态弹窗，包含以下子组件：
- `Dialog`: 根容器，管理打开/关闭状态
- `DialogTrigger`: 触发器，点击打开弹窗
- `DialogContent`: 内容区域，渲染弹窗主体
- `DialogHeader`: 头部区域，包含标题和关闭按钮
- `DialogTitle`: 标题文本
- `DialogDescription`: 描述文本（可选）
- `DialogFooter`: 底部区域，放置操作按钮

Dialog 组件 SHALL 具备以下交互特性：
- Focus trap：焦点锁定在弹窗内
- ESC 关闭：按 Escape 键关闭弹窗
- Backdrop 关闭：点击遮罩层关闭弹窗
- 动画过渡：淡入淡出 + 缩放动画

Dialog 组件 SHALL 应用 Glassmorphism 样式：
- 内容区域：`glass` 类（bg-white/15、backdrop-blur-xl、border-white/20）
- 遮罩层：`bg-black/50 backdrop-blur-sm`
- 圆角：`rounded-2xl`

#### Scenario: 打开弹窗
- **WHEN** 点击 DialogTrigger 或设置 `open={true}`
- **THEN** 弹窗以动画形式显示
- **AND** 焦点移动到弹窗内第一个可聚焦元素
- **AND** 背景显示半透明遮罩

#### Scenario: ESC 关闭
- **WHEN** 弹窗打开状态下按 Escape 键
- **THEN** 弹窗以动画形式关闭
- **AND** 焦点返回到触发元素

#### Scenario: 点击遮罩关闭
- **WHEN** 点击弹窗外的遮罩区域
- **THEN** 弹窗关闭

#### Scenario: Focus trap
- **WHEN** 弹窗打开时按 Tab 键
- **THEN** 焦点在弹窗内元素间循环
- **AND** 不会移出弹窗

### Requirement: AddSite Dialog

系统 SHALL 使用 Dialog 组件重构"添加网站"弹窗，保持以下功能：
- 网址输入与自动 favicon 获取
- 名称输入与自动填充
- 实时预览卡片
- 添加/编辑两种模式

#### Scenario: 添加网站
- **WHEN** 打开添加网站弹窗
- **THEN** 显示空白表单
- **AND** 标题为"添加网站"

#### Scenario: 编辑网站
- **WHEN** 打开编辑网站弹窗
- **THEN** 表单预填充现有数据
- **AND** 标题为"编辑网站"

### Requirement: AddFolder Dialog

系统 SHALL 使用 Dialog 组件重构"添加文件夹"弹窗，保持以下功能：
- 文件夹名称输入
- 尺寸选择（1×2、2×2、2×1）
- 添加/编辑两种模式

#### Scenario: 添加文件夹
- **WHEN** 打开添加文件夹弹窗
- **THEN** 显示空白表单
- **AND** 默认选中 2×2 尺寸

### Requirement: Folder Detail Dialog

系统 SHALL 使用 Dialog 组件重构文件夹详情弹窗，保持以下功能：
- 显示文件夹内所有网站
- 支持拖拽排序
- 支持点击打开网站
- 支持编辑/删除操作

#### Scenario: 文件夹详情
- **WHEN** 点击文件夹卡片
- **THEN** 打开文件夹详情弹窗
- **AND** 显示文件夹内所有网站列表

#### Scenario: 拖拽排序
- **WHEN** 在文件夹详情中拖拽网站
- **THEN** 实时更新网站顺序
- **AND** 拖拽结束后持久化顺序

### Requirement: Settings Dialog

系统 SHALL 使用 Dialog 组件重构设置面板，保持以下功能：
- Tab 切换（通用/壁纸/备份）
- 各设置项的读写
- WebDAV 连接与备份管理

#### Scenario: 打开设置
- **WHEN** 点击设置按钮
- **THEN** 打开设置弹窗
- **AND** 默认显示"通用"Tab
