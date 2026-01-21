# ui-form Specification

## Purpose
TBD - created by archiving change refactor-ui-shadcn-vue. Update Purpose after archive.
## Requirements
### Requirement: Select 组件

系统 SHALL 提供 Select 组件用于下拉选择，包含以下子组件：
- `Select`: 根容器，管理选中状态
- `SelectTrigger`: 触发按钮，显示当前选中值
- `SelectContent`: 下拉内容区域
- `SelectItem`: 选项项
- `SelectValue`: 显示选中值的占位组件

Select 组件 SHALL 具备以下交互特性：
- 点击触发器展开下拉
- 键盘导航（上下方向键、Enter 选择）
- ESC 关闭
- 点击外部关闭
- 支持 `v-model` 双向绑定

Select 组件 SHALL 应用 Glassmorphism 样式：
- 触发器：`bg-white/10 border-white/10`
- 下拉内容：`glass` 类
- 选项 hover：`bg-white/10`

#### Scenario: 壁纸来源选择
- **WHEN** 点击壁纸来源 Select
- **THEN** 显示可选来源列表（Bing、Picsum）
- **AND** 选中项带有高亮样式

#### Scenario: 轮播间隔选择
- **WHEN** 点击轮播间隔 Select
- **THEN** 显示时间选项（15分钟、30分钟、1小时等）

#### Scenario: 键盘选择
- **WHEN** Select 展开时按方向键和 Enter
- **THEN** 可通过键盘选择选项

### Requirement: Switch 组件

系统 SHALL 提供 Switch 组件用于开关切换，具备：
- 两种状态：开（checked）/ 关（unchecked）
- 动画过渡效果
- 支持 `v-model` 双向绑定
- 支持 `disabled` 状态

Switch 组件 SHALL 应用 Glassmorphism 样式：
- 关闭状态：`bg-white/20`
- 打开状态：`bg-blue-500`
- 滑块：白色圆形，带过渡动画

#### Scenario: 搜索栏开关
- **WHEN** 点击"显示搜索栏"开关
- **THEN** 开关状态切换
- **AND** 滑块以动画移动到另一侧

#### Scenario: 壁纸开关
- **WHEN** 点击"启用背景壁纸"开关
- **THEN** 开关状态切换
- **AND** 相关设置项根据状态显示/隐藏

#### Scenario: 键盘操作
- **WHEN** Switch 聚焦时按 Space 或 Enter
- **THEN** 开关状态切换

### Requirement: Tabs 组件

系统 SHALL 提供 Tabs 组件用于标签页切换，包含以下子组件：
- `Tabs`: 根容器，管理当前激活的 Tab
- `TabsList`: Tab 按钮容器
- `TabsTrigger`: 单个 Tab 按钮
- `TabsContent`: Tab 对应的内容区域

Tabs 组件 SHALL 具备以下交互特性：
- 点击 Tab 切换内容
- 键盘导航（左右方向键切换 Tab）
- 支持 `v-model` 双向绑定当前 Tab

Tabs 组件 SHALL 应用 Glassmorphism 样式：
- TabsList 背景：`border-b border-white/10`
- 激活 Tab：`text-white bg-white/10`
- 非激活 Tab：`text-white/60 hover:text-white/80`

#### Scenario: 设置面板 Tab 切换
- **WHEN** 点击"壁纸"Tab
- **THEN** 显示壁纸设置内容
- **AND** "壁纸"Tab 显示为激活状态

#### Scenario: 键盘切换 Tab
- **WHEN** Tab 聚焦时按左右方向键
- **THEN** 焦点移动到相邻 Tab
- **AND** 内容区域同步切换

### Requirement: SearchBar 组件重构

系统 SHALL 使用 Input + Button 组件重构 SearchBar，保持以下功能：
- 搜索输入框
- 快捷键支持（`/`、`Ctrl/Cmd + K`）
- 提交搜索（优先使用 browser.search API）

#### Scenario: 快捷键聚焦
- **WHEN** 按 `/` 或 `Ctrl/Cmd + K`
- **THEN** 搜索框获得焦点

#### Scenario: 搜索提交
- **WHEN** 输入搜索词后按 Enter
- **THEN** 调用 browser.search API 执行搜索
- **OR** 跳转到 Google 搜索页（不支持时）

